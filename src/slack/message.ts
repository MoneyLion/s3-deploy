import dotenv from 'dotenv'
dotenv.config()

import request from 'request'

const API_BASE = 'https://slack.com/api'
const token = process.env.SLACK_TOKEN

export const postToChannel = (channel: string, text: string, attachments?: string[]) => {
  const url = `${API_BASE}/chat.postMessage`
  const post: Record<string, any> = { text, channel }
  if (attachments.length) post.attachments = attachments.map(text => ({ text }))

  const body = JSON.stringify(post)

  return new Promise((resolve, reject) => {
    request.post(
      url,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      },
      (err, res) => {
        if (err) return reject(err)
        resolve(res)
      }
    )
  })
}
