import S3, { ManagedUpload } from 'aws-sdk/clients/s3'
import { resolver, createBucketPolicyRequest } from './util'
import { Readable } from 'stream'

const s3 = new S3()

if (typeof process.env.AWS_ACCESS_KEY_ID === 'undefined') {
  // tslint:disable-next-line:no-var-requires
  const dotenv = require('dotenv')
  dotenv.config()
}

s3.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_DEFAULT_REGION
})

export const createBucket = (Bucket: string) => {
  const params = { Bucket }
  return new Promise<S3.CreateBucketOutput>((resolve, reject) => s3.createBucket(params, resolver(resolve, reject)))
}

export const checkBucket = async (Bucket: string) => {
  try {
    const params = { Bucket }
    await new Promise((resolve, reject) => s3.headBucket(params, resolver(resolve, reject)))
    return true
  } catch {
    return false
  }
}

export const deleteBucket = async (Bucket: string) => {
  await emptyBucket(Bucket)

  const params = { Bucket }
  return new Promise((resolve, reject) => s3.deleteBucket(params, resolver(resolve, reject)))
}

export const emptyBucket = async (Bucket: string) => {
  if (!(await checkBucket(Bucket))) return

  const objects = await listObjects(Bucket)

  if (objects.Contents && objects.Contents.length) {
    const Objects = objects.Contents.map(({ Key }) => ({ Key }))
    await deleteObjects(Bucket, Objects)
  }
}

export const listObjects = (Bucket: string) => {
  const params = { Bucket }
  return new Promise<S3.Types.ListObjectsV2Output>((resolve, reject) =>
    s3.listObjectsV2(params, resolver(resolve, reject))
  )
}

export const deleteObjects = (Bucket: string, Objects: { Key: string }[]) => {
  const params = { Bucket, Delete: { Objects } }
  return new Promise<S3.DeleteObjectsOutput>((resolve, reject) => s3.deleteObjects(params, resolver(resolve, reject)))
}

export const setPolicy = (Bucket: string) => {
  const params = { Bucket, Policy: createBucketPolicyRequest(Bucket) }
  return new Promise((resolve, reject) => s3.putBucketPolicy(params, resolver(resolve, reject)))
}

export const getWebsite = (Bucket: string) => {
  const params = { Bucket }
  return new Promise<S3.GetBucketWebsiteOutput>((resolve, reject) =>
    s3.getBucketWebsite(params, resolver(resolve, reject))
  )
}

export const setWebsite = (Bucket: string) => {
  const params = {
    Bucket,
    WebsiteConfiguration: { IndexDocument: { Suffix: 'index.html' }, ErrorDocument: { Key: 'index.html' } }
  }
  return new Promise((resolve, reject) => s3.putBucketWebsite(params, resolver(resolve, reject)))
}

export const getLocation = (Bucket: string) => {
  const params = { Bucket }
  return new Promise<S3.GetBucketLocationOutput>((resolve, reject) =>
    s3.getBucketLocation(params, resolver(resolve, reject))
  )
}

export const upload = (
  Bucket: string,
  Key: string,
  Body: Buffer | Uint8Array | Blob | string | Readable,
  ContentType: string
) => {
  const params = { Bucket, Key, Body, ContentType }
  return new Promise<ManagedUpload.SendData>((resolve, reject) => s3.upload(params, resolver(resolve, reject)))
}
