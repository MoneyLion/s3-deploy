console.log = jest.fn()

jest.mock('fs')
jest.mock('mime-types')

const mockSync = jest.fn()
jest.mock('fast-glob', () => ({ sync: mockSync }))

const mockUpload = jest.fn()
const mockEmptyBucket = jest.fn()

jest.mock('./aws/s3', () => ({
  upload: mockUpload,
  emptyBucket: mockEmptyBucket
}))

const mockCreateInvalidation = jest.fn()

jest.mock('./aws/cloudfront', () => ({ createInvalidation: mockCreateInvalidation }))

const mockPostToChannel = jest.fn()

jest.mock('./slack/message', () => ({ postToChannel: mockPostToChannel }))

import { promote } from './promote'

describe('promote', () => {
  const domain = 'test.example.com'
  const distribution = 'ABC123'
  const dir = '.'
  const files = ['test', 'file', 'foo']

  afterEach(() => jest.clearAllMocks())

  test('will throw error if no files found', () => {
    mockSync.mockReturnValueOnce([])

    expect(promote(domain, distribution, dir)).rejects.toThrowError()
  })

  test('empties the bucket before uploading', async () => {
    mockSync.mockReturnValueOnce(files)

    await promote(domain, distribution, dir)

    expect(mockEmptyBucket).toHaveBeenCalledTimes(1)
    expect(mockEmptyBucket).toHaveBeenCalledWith(domain)
  })

  test('uploads the files', async () => {
    mockSync.mockReturnValueOnce(files)

    await promote(domain, distribution, dir)

    expect(mockUpload).toHaveBeenCalledTimes(files.length)
  })

  test('creates cloudfront invalidation', async () => {
    mockSync.mockReturnValueOnce(files)

    await promote(domain, distribution, dir)

    expect(mockCreateInvalidation).toHaveBeenCalledTimes(1)
  })

  test('will post to slack channel if provided', async () => {
    const channel = 'channel'
    mockSync.mockReturnValueOnce(files)

    await promote(domain, distribution, dir, channel)

    expect(mockPostToChannel).toHaveBeenCalledTimes(1)
  })
})
