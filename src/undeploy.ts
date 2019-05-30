import { deleteBucket } from './aws/s3'
import { deleteRecordSet } from './aws/route53'
import { ParsedArgs } from './cli'

export const undeploy = async ({ domain, zone }: ParsedArgs) => {
  await deleteBucket(domain)
  await deleteRecordSet(domain, zone)
}
