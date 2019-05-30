import { deleteBucket } from './aws/s3'
import { deleteRecordSet } from './aws/route53'

export const undeploy = async (domain: string, zone: string) => {
  await deleteBucket(domain)
  await deleteRecordSet(domain, zone)
}
