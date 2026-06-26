import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth'
import { pool } from '@/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Total songs created
  const { rows: totalRows } = await pool.query(
    'SELECT COUNT(*) as count FROM songs WHERE user_id = $1',
    [user.id]
  )
  const totalSongs = parseInt(totalRows[0].count)

  // Total duration of completed songs
  const { rows: durationRows } = await pool.query(
    'SELECT COALESCE(SUM(duration), 0) as total FROM songs WHERE user_id = $1 AND status = $2',
    [user.id, 'completed']
  )
  const totalDuration = Math.round(Number(durationRows[0].total))

  // Songs by style
  const { rows: styleRows } = await pool.query(
    'SELECT style, COUNT(*) as count FROM songs WHERE user_id = $1 GROUP BY style ORDER BY count DESC',
    [user.id]
  )
  const stylesBreakdown = styleRows.map((r: any) => ({
    style: r.style,
    count: parseInt(r.count),
  }))

  // Songs by status
  const { rows: statusRows } = await pool.query(
    'SELECT status, COUNT(*) as count FROM songs WHERE user_id = $1 GROUP BY status',
    [user.id]
  )
  const statusBreakdown = statusRows.map((r: any) => ({
    status: r.status,
    count: parseInt(r.count),
  }))

  return NextResponse.json({
    totalSongs,
    totalDuration,
    stylesBreakdown,
    statusBreakdown,
  })
}
