import Route53 from 'aws-sdk/clients/route53'
import { createRecordSetsRequest, resolver } from './util'

const route53 = new Route53()

if (typeof process.env.AWS_ACCESS_KEY_ID === 'undefined') {
  // tslint:disable-next-line: no-var-requires
  const dotenv = require('dotenv')
  dotenv.config()
}

route53.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_DEFAULT_REGION
})

export const createRecordSet = async (name: string, zone: string) => {
  const params = createRecordSetsRequest('CREATE', name, zone)
  return new Promise<Route53.ChangeResourceRecordSetsResponse>((resolve, reject) =>
    route53.changeResourceRecordSets(params, resolver(resolve, reject))
  )
}

export const deleteRecordSet = async (name: string, zone: string) => {
  const params = createRecordSetsRequest('DELETE', name, zone)
  return new Promise<Route53.ChangeResourceRecordSetsResponse>((resolve, reject) =>
    route53.changeResourceRecordSets(params, resolver(resolve, reject))
  )
}
