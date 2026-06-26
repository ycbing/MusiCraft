import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/db'

// GET public stats — no auth required
export async function GET(req: NextRequest) {
  try {
    const [totalSongsRes, totalCreatorsRes, totalStylesRes, avgDurationRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM songs WHERE status = 'completed'"),
      pool.query('SELECT COUNT(DISTINCT user_id) as count FROM songs'),
      pool.query('SELECT COUNT(DISTINCT style) as count FROM songs'),
      pool.query("SELECT ROUND(AVG(duration)) as avg FROM songs WHERE status = 'completed' AND duration IS NOT NULL"),
    ])

    const totalSongs = parseInt(totalSongsRes.rows[0].count) || 0
    const totalCreators = parseInt(totalCreatorsRes.rows[0].count) || 0
    const totalStyles = parseInt(totalStylesRes.rows[0].count) || 0
    const avgDuration = parseInt(avgDurationRes.rows[0].avg) || 0

    // Recent completed songs for featured section
    const { rows: recentSongs } = await pool.query(
      "SELECT s.id, s.title, s.style, s.mood, s.language, s.audio_url, s.cover_url, s.duration, s.status, s.created_at, s.updated_at, u.name as user_name FROM songs s JOIN users u ON s.user_id = u.id WHERE s.status = 'completed' ORDER BY s.created_at DESC LIMIT 6"
    )

    const mappedSongs = recentSongs.map((song: any) => ({
      id: String(song.id),
      title: song.title,
      lyrics: '',
      style: song.style,
      mood: song.mood,
      language: song.language,
      audioUrl: song.audio_url,
      coverUrl: song.cover_url,
      duration: song.duration ? Number(song.duration) : null,
      status: song.status,
      createdAt: song.created_at,
      updatedAt: song.updated_at,
      userId: String(song.user_id),
    }))

    return NextResponse.json({
      totalSongs,
      totalCreators,
      totalStyles,
      avgDuration,
      featuredSongs: mappedSongs,
    })
  } catch (err: any) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
