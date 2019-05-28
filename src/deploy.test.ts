console.log = jest.fn()

jest.mock('fs')
jest.mock('mime-types')

const mockSync = jest.fn()
jest.mock('fast-glob', () => ({ sync: mockSync }))

const mockCreateBucket = jest.fn()
const mockSetPolicy = jest.fn()
const mockSetWebsite = jest.fn()
const mockUpload = jest.fn()
const mockCheckBucket = jest.fn()
const mockEmptyBucket = jest.fn()

jest.mock('./aws/s3', () => ({
  createBucket: mockCreateBucket,
  setPolicy: mockSetPolicy,
  setWebsite: mockSetWebsite,
  upload: mockUpload,
  checkBucket: mockCheckBucket,
  emptyBucket: mockEmptyBucket
}))

const mockCreateRecordSet = jest.fn()

jest.mock('./aws/route53', () => ({ createRecordSet: mockCreateRecordSet }))

const mockPostToChannel = jest.fn()

jest.mock('./slack/message', () => ({ postToChannel: mockPostToChannel }))

import { deploy } from './deploy'

describe('deploy', () => {
  const domain = 'test.example.com'
  const zone = 'ABC123'
  const dir = '.'
  const files = ['test', 'file', 'foo']

  afterEach(() => jest.clearAllMocks())

  test('creates a bucket if none exists', async () => {
    mockSync.mockReturnValueOnce(files)

    mockCheckBucket.mockResolvedValueOnce(false)

    await deploy(domain, zone, dir)

    expect(mockCreateBucket).toHaveBeenCalledTimes(1)
    expect(mockEmptyBucket).toHaveBeenCalledTimes(0)
  })

  test('creates a record set if no bucket exists', async () => {
    mockSync.mockReturnValueOnce(files)

    mockCheckBucket.mockResolvedValueOnce(false)

    await deploy(domain, zone, dir)

    expect(mockCreateRecordSet).toHaveBeenCalledTimes(1)
    expect(mockCreateRecordSet).toHaveBeenCalledWith(domain, zone)
  })

  test('will throw error if no files found', () => {
    mockSync.mockReturnValueOnce([])

    expect(deploy(domain, zone, dir)).rejects.toThrowError()
  })

  test("doesn't creates a bucket if one exists", async () => {
    mockSync.mockReturnValueOnce(files)

    mockCheckBucket.mockResolvedValueOnce(true)

    await deploy(domain, zone, dir)

    expect(mockCreateBucket).toHaveBeenCalledTimes(0)
    expect(mockEmptyBucket).toHaveBeenCalledTimes(1)
  })

  test('uploads all found files to bucket', async () => {
    mockSync.mockReturnValueOnce(files)

    mockCheckBucket.mockResolvedValueOnce(true)

    await deploy(domain, zone, dir)

    expect(mockUpload).toHaveBeenCalledTimes(files.length)
  })

  test('will post to slack channel if provided', async () => {
    const channel = 'channel'
    mockSync.mockReturnValueOnce(files)

    mockCheckBucket.mockResolvedValueOnce(false)

    await deploy(domain, zone, dir, channel)

    expect(mockPostToChannel).toHaveBeenCalledTimes(1)
  })
})
