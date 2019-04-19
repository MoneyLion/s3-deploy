# s3-deploy

A command line tool to deploy static assets to an S3 bucket.

## Required ENV Variables

- NPM_TOKEN
- AWS_SECRET_ACCESS_KEY
- AWS_ACCESS_KEY_ID
- AWS_DEFAULT_REGION

### optional

- CODEFRESH_SLACK_BOT_TOKEN

## Usage

`npx @moneylion/s3-deploy`

## Commands

### `deploy`

This will create a new S3 bucket and point route53 at it. The last argument must be the directoy to be uploaded.

requires:

- host
- bucket
- zone

e.g.<br>
`npx @moneylion/s3-deploy deploy --host example.com --bucket test --zone Z2XDC2IJ26IK32 ./dist`

### `undeploy`

This will delete an S3 bucket and the route53 record set.

requires:

- host
- bucket
- zone

e.g.<br>
`npx @moneylion/s3-deploy undeploy --host example.com --bucket test --zone Z2XDC2IJ26IK32`

### `promote`

> requires an already existing bucket <br>
> requires an already existing cloudfront distribution

This will not create a new bucket, it will instead empty it and upload the new assets to that bucket. It will then invalidate the cloudfront cache.

requires:

- host
- bucket
- distribution

e.g.<br>
`npx @moneylion/s3-deploy promote --host example.com --bucket test --distribution EINBTGEF4J77C ./dist`

---

Bucket names are constructed by concatenating the `host` and `bucket` strings. The last argument must be the directoy to be uploaded.

bucket = test <br>
host = example.com

Will give you `test.example.com` as the bucket name.

---

Both `deploy` and `promote` can take in a `channel` argument, this will be the slack channel you want it to post to.

---

## Troubleshooting

### Getting 404's from npm

This is a private script and it reads from `.npmrc` for the auth token.

A quick & dirty workaround for CI or Docker is to create a local `.npmrc` before running the script.

`echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $(pwd)/.npmrc`

Then run it with the `--userconfig` flag.

`npx --userconfig $(pwd)/.npmrc @moneylion/s3-deploy`

### Undefined environment variables

It might be necessary to inject the environment variable directly into the script.

`AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION npx @moneylion/s3-deploy`
