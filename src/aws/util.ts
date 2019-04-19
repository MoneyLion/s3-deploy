export const resolver = <T, E>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: E) => void) => (
  err: E,
  data: T
) => (err ? reject(err) : resolve(data))

export const createBucketPolicyRequest = (Bucket: string) =>
  JSON.stringify({
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${Bucket}/*`
      }
    ]
  })

export const createRecordSetsRequest = (Action: string, Name: string, HostedZoneId: string) => {
  return {
    HostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action,
          ResourceRecordSet: {
            Name,
            Type: 'A',
            AliasTarget: {
              // This is the AWS S3 zone id
              HostedZoneId: 'Z3AQBSTGFYJSTF',
              DNSName: 's3-website-us-east-1.amazonaws.com.',
              EvaluateTargetHealth: false
            }
          }
        }
      ]
    }
  }
}
