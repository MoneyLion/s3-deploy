const mockDeleteBucket = jest.fn()
const mockDeleteRecordSet = jest.fn()

jest.mock('./aws/s3', () => ({ deleteBucket: mockDeleteBucket }))
jest.mock('./aws/route53', () => ({ deleteRecordSet: mockDeleteRecordSet }))

import { undeploy } from './undeploy'

describe('undeploy', () => {
  test('can undeploy', async () => {
    mockDeleteBucket.mockResolvedValueOnce(true)
    mockDeleteRecordSet.mockResolvedValueOnce(true)

    const domain = 'test.example.com'
    const zone = 'ABC123'

    await undeploy(domain, zone)

    expect(mockDeleteBucket).toHaveBeenCalledTimes(1)
    expect(mockDeleteBucket).toHaveBeenCalledWith(domain)

    expect(mockDeleteRecordSet).toHaveBeenCalledTimes(1)
    expect(mockDeleteRecordSet).toHaveBeenCalledWith(domain, zone)
  })
})
