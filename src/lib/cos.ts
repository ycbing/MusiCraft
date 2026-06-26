import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const COS_BUCKET = process.env.COS_BUCKET || 'craftmind-1307905190'
const COS_REGION = process.env.COS_REGION || 'ap-shanghai'

function getCosClient() {
  return new S3Client({
    region: COS_REGION,
    endpoint: `https://cos.${COS_REGION}.myqcloud.com`,
    credentials: {
      accessKeyId: process.env.COS_SECRET_ID!,
      secretAccessKey: process.env.COS_SECRET_KEY!,
    },
    forcePathStyle: false,
  })
}

export async function uploadToCos(key: string, body: Buffer | Uint8Array | string, contentType: string) {
  const client = getCosClient()
  await client.send(new PutObjectCommand({
    Bucket: COS_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'private',
  }))
  return `cos://${COS_BUCKET}/${key}`
}

export async function getCosSignedUrl(key: string, expiresIn = 3600) {
  const client = getCosClient()
  const command = new GetObjectCommand({ Bucket: COS_BUCKET, Key: key })
  return getSignedUrl(client, command, { expiresIn })
}

export function extractCosKey(cosUrl: string): string | null {
  const match = cosUrl.match(/^cos:\/\/([^/]+)\/(.+)$/)
  return match ? match[2] : null
}

export function parseCosUrl(url: string): string | null {
  if (url.startsWith('cos://')) {
    const key = extractCosKey(url)
    if (key) return `/api/cos/${encodeURIComponent(key)}`
  }
  return url
}
