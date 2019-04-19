import { deleteBucket } from './aws/s3'
import { deleteRecordSet } from './aws/route53'

export const undeploy = async (bucket: string, host: string, zone: string) => {
  const fqdn = `${bucket}.${host}`
  await deleteBucket(fqdn)
  await deleteRecordSet(fqdn, zone)
}
