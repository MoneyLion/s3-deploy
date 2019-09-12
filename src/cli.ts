import mri from 'mri'

export interface ParsedArgs {
  action: 'deploy' | 'undeploy' | 'promote'
  domain: string

  zone?: string
  distribution?: string
  channel?: string
  message?: string
  dir?: string
}

const errors = {
  domain: {
    req: 'Domain is required',
    char: "Domain can only be a-z, 0-9, '.', and '-'."
  },
  zone: {
    req: 'Zone is required',
    char: 'Zone can only be A-Z and 0-9.',
    len: 'Zone has to be 14 characters long.'
  },
  directory: { req: 'Directory is required' },
  distribution: { req: 'Distribution is required' }
}

const parseArgs = (argv: string[]): ParsedArgs => {
  const args = mri(argv, { string: ['domain', 'zone', 'channel', 'message'] })

  const {
    _: [action, dir],
    domain,
    zone,
    distribution,
    channel,
    message
  } = args

  return { action, dir, domain, zone, channel, distribution, message } as ParsedArgs
}

const forcedExit = (msg: string) => {
  console.error(msg)
  process.exit(1)
}

const isValidAction = (action: string) => {
  const allowedActions = new Set(['promote', 'deploy', 'undeploy'])

  if (!allowedActions.has(action))
    return `${action} is not a valid action. Allowed actions: ${Array.from(allowedActions.values()).join(', ')}`

  return true
}

const isValidDomain = (domain: string) => {
  if (typeof domain === 'undefined') return errors.domain.req
  if (!/^[a-z0-9-\.]+$/.test(domain)) return errors.domain.char

  return true
}

const isValidZone = (zone: string) => {
  if (typeof zone === 'undefined') return errors.zone.req
  if (!/^[A-Z0-9]+$/.test(zone)) return errors.zone.char
  if (zone.length !== 14) return errors.zone.len

  return true
}

const isValidDir = (dir: string) => {
  if (typeof dir === 'undefined') return errors.directory.req

  return true
}

const isValidDistribution = (distribution: string) => {
  if (typeof distribution === 'undefined') return errors.distribution.req

  return true
}

const deploy = ({ domain, zone, dir, channel, message }: ParsedArgs) => {
  const validDomain = isValidDomain(domain)
  const validZone = isValidZone(zone)
  const validDir = isValidDir(dir)

  if (validDomain !== true) return forcedExit(validDomain)
  if (validZone !== true) return forcedExit(validZone)
  if (validDir !== true) return forcedExit(validDir)

  require('./deploy').deploy(domain, zone, dir, channel, message)
}

const undeploy = ({ domain, zone, channel, message }: ParsedArgs) => {
  const validDomain = isValidDomain(domain)
  const validZone = isValidZone(zone)

  if (validDomain !== true) return forcedExit(validDomain)
  if (validZone !== true) return forcedExit(validZone)

  require('./undeploy').undeploy(domain, zone, channel, message)
}

const promote = ({ domain, distribution, dir, channel, message }: ParsedArgs) => {
  const validDomain = isValidDomain(domain)
  const validDistribution = isValidDistribution(distribution)
  const validDir = isValidDir(dir)

  if (validDomain !== true) return forcedExit(validDomain)
  if (validDistribution !== true) return forcedExit(validDistribution)
  if (validDir !== true) return forcedExit(validDir)

  require('./promote').promote(domain, distribution, dir, channel, message)
}

export const cli = (argv: string[]) => {
  const args = parseArgs(argv)

  const { action } = args

  const validAction = isValidAction(action)
  if (validAction !== true) return forcedExit(validAction)

  if (action === 'deploy') deploy(args)
  else if (action === 'undeploy') undeploy(args)
  else if (action === 'promote') promote(args)
}
