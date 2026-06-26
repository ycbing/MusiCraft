import { NextRequest, NextResponse } from 'next/server'
import { generateLyrics, improveLyrics } from '@/lib/ai/lyrics-generator'

export async function POST(req: NextRequest) {
  try {
    const { action, ...input } = await req.json()

    if (action === 'generate') {
      const lyrics = await generateLyrics(input)
      return NextResponse.json({ lyrics })
    }

    if (action === 'improve') {
      const lyrics = await improveLyrics(input.lyrics, input.feedback, input.language)
      return NextResponse.json({ lyrics })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('Lyrics generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
