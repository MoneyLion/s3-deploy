# s3-deploy

A command line tool to deploy static sites to an S3 bucket.

## Why?

At [Moneylion](https://moneylion.com), we have a lot of web properties. In order to untangle some of our deploy processes for frontend assets, we developed this script which allows us to quickly and painlessly configure a new deployment to S3.

One of the main uses for this script is to create temporary review-apps. When a new PR is created, this triggers a build in our CI pipeline, if all the tests pass and it builds successfully, then we deploy that PR to a temporary and shareable URL. Once the PR is closed, we tear it down.

## Required ENV Variables

- AWS_SECRET_ACCESS_KEY
- AWS_ACCESS_KEY_ID
- AWS_DEFAULT_REGION

### optional

- SLACK_TOKEN

## Usage

`npx @moneylion/s3-deploy`

## Arguments

| argument       | description                    |
| -------------- | ------------------------------ |
| `domain`       | A fully qualified domain name. |
| `zone`         | The route53 HostedZoneId.      |
| `distribution` | The CloudFront DistributionId. |
| `channel`      | The slack channel name.        |

## Commands

### `deploy`

This will create a new S3 bucket and point route53 at it. The last argument must be the directory to be uploaded. If an S3 bucket with this name already exists, then it will be cleared before the new files are uploaded.

requires:

- domain
- zone

e.g.<br>
`npx @moneylion/s3-deploy deploy --domain test.example.com --zone Z2XDC2IJ26IK32 ./dist`

### `undeploy`

This will delete an S3 bucket and the route53 record set.

requires:

- domain
- zone

optional

- channel

e.g.<br>
`npx @moneylion/s3-deploy undeploy --domain example.com --zone Z2XDC2IJ26IK32`

### `promote`

_Creating a cloudfront distribution is outside the scope of this script. There are no future plans to support this feature._

> requires an already existing bucket <br>
> requires an already existing cloudfront distribution

This will not create a new bucket, it will instead empty an already existing and then upload the new assets to that bucket. It will also invalidate the cloudfront cache.

requires:

- domain
- distribution

e.g.<br>
`npx @moneylion/s3-deploy promote --domain test.example.com --distribution ABCDEFGH1I23J ./dist`

---

Both `deploy` and `promote` can take in a `channel` argument, this will be the slack channel you want it to post to.

---

## Troubleshooting

### Undefined environment variables

It might be necessary to inject the environment variable directly into the script.

`AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION npx @moneylion/s3-deploy`
