import { deleteBucket } from './aws/s3'
import { deleteRecordSet } from './aws/route53'
import { postToChannel } from './slack/message'

export const undeploy = async (domain: string, zone: string, channel?: string, message?: string) => {
  await deleteBucket(domain)
  await deleteRecordSet(domain, zone)

  if (channel) {
    const text = `Undeployed ${domain}`
    const attachments = !message ? [] : [...message.split(',')]
    await postToChannel(channel, text, attachments)
  }
}
