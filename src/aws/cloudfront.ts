import CloudFront from 'aws-sdk/clients/cloudfront'

import { resolver } from './util'

const cloudFront = new CloudFront()

export const createInvalidation = (DistributionId: string) => {
  const params = {
    DistributionId,
    InvalidationBatch: {
      CallerReference: (+new Date()).toString(),
      Paths: {
        Quantity: 1,
        Items: ['/index.html']
      }
    }
  }

  return new Promise<CloudFront.CreateInvalidationResult>((resolve, reject) =>
    cloudFront.createInvalidation(params, resolver(resolve, reject))
  )
}
