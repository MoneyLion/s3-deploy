import mri from 'mri'

const argv = process.argv.slice(2)
const args = mri(argv, { string: ['bucket', 'host', 'zone', 'channel'] })

const {
  _: [action, dir],
  bucket,
  host,
  zone,
  channel,
  distribution
} = args

const allowedActions = new Set(['promote', 'deploy', 'undeploy'])

if (!allowedActions.has(action)) {
  console.log(`${action} is not a valid action. Allowed actions: ${Array.from(allowedActions.values()).join(', ')}`)
  process.exit(1)
}

if (action === 'deploy' || action === 'undeploy') {
  if (typeof zone === 'undefined') throw new Error('Zone is required')
  if (!/^[A-Z0-9]+$/.test(zone)) throw new Error(`Zone can only be A-Z and 0-9: ${zone}`)
  if (zone.length !== 14) throw new Error(`Zone has to be 14 characters long: ${zone}`)
}

if (action === 'deploy' || action === 'promote') {
  if (typeof dir === 'undefined') throw new Error('Directory is required')
}

if (typeof host === 'undefined') throw new Error('Host is required')
if (typeof bucket === 'undefined') throw new Error('Bucket is required')

if (!/^[a-z0-9-\.]+$/.test(host)) throw new Error(`Host can only be a-z, 0-9, '.', and '-': ${host}`)
if (!/^[a-z0-9-]+$/.test(bucket)) throw new Error(`Bucket can only be a-z, 0-9 and '-': ${bucket}`)

if (action === 'deploy') {
  // tslint:disable-next-line:no-var-requires
  require('./deploy').deploy(bucket, host, zone, dir, channel)
} else if (action === 'undeploy') {
  // tslint:disable-next-line:no-var-requires
  require('./undeploy').undeploy(bucket, host, zone)
} else if (action === 'promote') {
  if (typeof distribution === 'undefined') throw new Error('Distribution is required')
  // tslint:disable-next-line:no-var-requires
  require('./promote').promote(bucket, host, distribution, dir, channel)
}
