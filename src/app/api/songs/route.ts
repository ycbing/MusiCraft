import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth'
import { pool } from '@/db'
import { parseCosUrl } from '@/lib/cos'

// GET - list user's songs
export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { rows } = await pool.query(
    'SELECT * FROM songs WHERE user_id = $1 ORDER BY created_at DESC',
    [user.id]
  )

  // Map snake_case DB fields to camelCase for frontend
  const mappedSongs = rows.map((song: any) => ({
    id: String(song.id),
    title: song.title,
    lyrics: song.lyrics,
    style: song.style,
    mood: song.mood,
    language: song.language,
    audioUrl: song.audio_url ? parseCosUrl(song.audio_url) : null,
    coverUrl: song.cover_url ? parseCosUrl(song.cover_url) : null,
    duration: song.duration ? Number(song.duration) : null,
    status: song.status,
    createdAt: song.created_at,
    updatedAt: song.updated_at,
    userId: song.user_id,
  }))

  return NextResponse.json({ songs: mappedSongs })
}

// POST - create new song
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { title, lyrics, style, mood, language } = await req.json()

  const { rows } = await pool.query(
    'INSERT INTO songs (user_id, title, lyrics, style, mood, language, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [user.id, title || 'Untitled', lyrics || '', style || 'pop', mood || 'happy', language || 'zh', 'draft']
  )

  const song = rows[0]
  const mappedSong = {
    id: String(song.id),
    title: song.title,
    lyrics: song.lyrics,
    style: song.style,
    mood: song.mood,
    language: song.language,
    audioUrl: null,
    coverUrl: null,
    duration: null,
    status: song.status,
    createdAt: song.created_at,
    updatedAt: song.updated_at,
  }

  return NextResponse.json({ song: mappedSong }, { status: 201 })
}
