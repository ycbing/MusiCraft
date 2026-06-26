import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/db'
import { parseCosUrl } from '@/lib/cos'

// GET song by share token — public, no auth required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { rows } = await pool.query(
    'SELECT s.title, s.style, s.mood, s.language, s.audio_url, s.cover_url, s.duration, s.status, u.name as user_name FROM songs s JOIN users u ON s.user_id = u.id WHERE s.share_token = $1 AND s.status = $2',
    [token, 'completed']
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Song not found or not shared' }, { status: 404 })
  }

  const song = rows[0]

  return NextResponse.json({
    song: {
      title: song.title,
      style: song.style,
      mood: song.mood,
      language: song.language,
      audioUrl: song.audio_url ? parseCosUrl(song.audio_url) : null,
      coverUrl: song.cover_url ? parseCosUrl(song.cover_url) : null,
      duration: song.duration ? Number(song.duration) : null,
      status: song.status,
      userName: song.user_name,
    },
  })
}
