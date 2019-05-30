import fs from 'fs'
import path from 'path'

import fg from 'fast-glob'
import mime from 'mime-types'

import { createBucket, setPolicy, setWebsite, upload, checkBucket, emptyBucket } from './aws/s3'

import { createRecordSet } from './aws/route53'
import { postToChannel } from './slack/message'

const ROOT = process.cwd()

interface FileType {
  key: string
  body: fs.ReadStream
  contentType: string
}

export const deploy = async (domain: string, zone: string, dir: string, channel?: string, message?: string) => {
  const files = getFiles(dir)

  const bucketExists = await checkBucket(domain)

  if (!bucketExists) await makeBucket(domain)
  else await emptyBucket(domain)

  await uploadFiles(domain, files)

  if (!bucketExists) await makeRecordSet(domain, zone)

  if (typeof channel !== 'undefined') {
    const attachments = !message ? [] : [message]
    await postToChannel(channel, `Deployed app: ${domain}`, attachments)
  }

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

const makeBucket = async (domain: string) => {
  await createBucket(domain)
  console.log('Done bucket.')

  await setPolicy(domain)
  console.log('Done policy.')

  await setWebsite(domain)
  console.log('Done website.')
}

const uploadFiles = async (domain: string, files: FileType[]) => {
  const total = files.length
  let done = 0

  const promises = files.map(async ({ key, body, contentType }) => {
    await upload(domain, key, body, contentType)
    console.log(`Done ${++done}/${total}.`)
  })

  await Promise.all(promises)
}

const makeRecordSet = async (domain: string, zone: string) => {
  await createRecordSet(domain, zone)
  console.log('Done route53.')
}
