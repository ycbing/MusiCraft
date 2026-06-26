import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth'
import { MiniMaxProvider } from '@/lib/ai/providers/minimax'
import { uploadToCos } from '@/lib/cos'
import { pool } from '@/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { songId, lyrics, style, mood, language, title, duration } = body

    // Check credits
    const creditsNeeded = 5
    if (user.credits < creditsNeeded) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Update status to generating
    await pool.query(
      'UPDATE songs SET status = $1, lyrics = $2, style = $3, mood = $4, language = $5 WHERE id = $6',
      ['generating', lyrics, style, mood, language || 'zh', songId]
    )

    // Generate music with MiniMax (background)
    const provider = new MiniMaxProvider()

    provider.generate({ lyrics, style, mood, language: language || 'zh', title, duration })
      .then(async (result) => {
        // Download the audio from MiniMax
        const audioRes = await fetch(result.audioUrl)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

        // Upload to COS
        const key = `musicraft/${user.id}/${songId}_${Date.now()}.mp3`
        const cosUrl = await uploadToCos(key, audioBuffer, 'audio/mpeg')

        // Update song record
        await pool.query(
          'UPDATE songs SET audio_url = $1, duration = $2, status = $3 WHERE id = $4',
          [cosUrl, result.duration, 'completed', songId]
        )

        // Deduct credits
        await pool.query(
          'UPDATE users SET credits = credits - $1 WHERE id = $2',
          [creditsNeeded, user.id]
        )
        await pool.query(
          'INSERT INTO usage_logs (user_id, action, cost) VALUES ($1, $2, $3)',
          [user.id, 'music_generate', creditsNeeded]
        )
      })
      .catch(async (err) => {
        console.error('Music generation error:', err)
        await pool.query(
          'UPDATE songs SET status = $1 WHERE id = $2',
          ['failed', songId]
        )
      })

    return NextResponse.json({ success: true, message: 'Music generation started' })
  } catch (err: any) {
    console.error('Music generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
