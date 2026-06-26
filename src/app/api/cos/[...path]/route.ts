import { NextRequest, NextResponse } from 'next/server'
import { getCosSignedUrl } from '@/lib/cos'

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname.replace('/api/cos/', '')
  const key = decodeURIComponent(pathname)

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  try {
    const signedUrl = await getCosSignedUrl(key)
    
    // Proxy the data instead of redirecting to avoid CORS issues
    const response = await fetch(signedUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from COS' }, { status: response.status })
    }
    
    const blob = await response.blob()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': blob.size.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (err: any) {
    console.error('COS proxy error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
