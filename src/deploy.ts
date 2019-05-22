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

export const deploy = async (bucket: string, host: string, zone: string, dir: string, channel: string) => {
  const files = getFiles(dir)
  const fqdn = `${bucket}.${host}`

  const bucketExists = await checkBucket(fqdn)

  if (!bucketExists) await makeBucket(fqdn)
  else await emptyBucket(fqdn)

  await uploadFiles(fqdn, files)

  if (!bucketExists) await makeRecordSet(fqdn, zone, channel)

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

const makeBucket = async (fqdn: string) => {
  await createBucket(fqdn)
  console.log('Done bucket.')

  await setPolicy(fqdn)
  console.log('Done policy.')

  await setWebsite(fqdn)
  console.log('Done website.')
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

const makeRecordSet = async (fqdn: string, zone: string, channel: string) => {
  await createRecordSet(fqdn, zone)
  console.log('Done route53.')
  const text = `Deployed app: ${fqdn}`
  if (typeof channel !== 'undefined') await postToChannel(channel, text)
}
