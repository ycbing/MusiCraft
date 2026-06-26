import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth'
import { pool } from '@/db'
import { parseCosUrl } from '@/lib/cos'

// GET single song
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows } = await pool.query(
    'SELECT s.*, u.name as user_name FROM songs s JOIN users u ON s.user_id = u.id WHERE s.id = $1',
    [id]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 })
  }

  const song = rows[0]
  // Convert COS URLs
  if (song.audio_url) song.audio_url = parseCosUrl(song.audio_url)
  if (song.cover_url) song.cover_url = parseCosUrl(song.cover_url)

  // Map snake_case DB fields to camelCase for frontend
  const mappedSong = {
    id: String(song.id),
    title: song.title,
    lyrics: song.lyrics,
    style: song.style,
    mood: song.mood,
    language: song.language,
    audioUrl: song.audio_url,
    coverUrl: song.cover_url,
    duration: song.duration ? Number(song.duration) : null,
    status: song.status,
    createdAt: song.created_at,
    updatedAt: song.updated_at,
    userId: song.user_id,
    userName: song.user_name,
    shareToken: song.share_token,
  }

  return NextResponse.json({ song: mappedSong })
}

// PUT update song
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  const body = await req.json()

  const allowedFields = ['title', 'lyrics', 'style', 'mood', 'language', 'share_token']
  const sets: string[] = []
  const values: any[] = []
  let idx = 1

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      sets.push(`${field} = $${idx++}`)
      values.push(body[field])
    }
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(id)
  values.push(user!.id)

  const { rows } = await pool.query(
    `UPDATE songs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
    values
  )

  return NextResponse.json({ song: rows[0] })
}

// DELETE song
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  await pool.query(
    'DELETE FROM songs WHERE id = $1 AND user_id = $2',
    [id, user!.id]
  )

  return NextResponse.json({ success: true })
}
