import fs from 'fs'
import path from 'path'

import fg from 'fast-glob'
import mime from 'mime-types'
import { upload, emptyBucket } from './aws/s3'
import { createInvalidation } from './aws/cloudfront'
import { postToChannel } from './slack/message'

const ROOT = process.cwd()

interface FileType {
  key: string
  body: fs.ReadStream
  contentType: string
}

export const promote = async (
  bucket: string,
  host: string,
  distribution: string,
  dir: string,
  channel: string = null
) => {
  const files = getFiles(dir)
  const fqdn = `${bucket}.${host}`

  await emptyBucket(fqdn)
  await uploadFiles(fqdn, files)
  await createInvalidation(distribution)

  const text = `Deployed ${fqdn}`
  if (channel) await postToChannel(channel, text)

  console.log('Done.')
}

const getFiles = (dir: string): FileType[] => {
  const fullDir = path.join(ROOT, dir)
  const files = fg.sync<string>(path.join(fullDir, '**', '*')).map(filename => {
    const key = filename.replace(`${fullDir}/`, '')
    const body = fs.createReadStream(filename)
    const contentType = mime.lookup(filename) || 'application/octet'
    return { key, body, contentType }
  })

  if (!files.length) throw new Error('No files to upload.')

  return files
}

const uploadFiles = async (fqdn: string, files: FileType[]) => {
  const total = files.length
  let done = 0

  const promises = files.map(async ({ key, body, contentType }) => {
    await upload(fqdn, key, body, contentType)
    console.log(`Done ${++done}/${total}.`)
  })

  await Promise.all(promises)
}
