import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth'
import { pool } from '@/db'

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (name.length > 50) {
    return NextResponse.json({ error: 'Name too long (max 50)' }, { status: 400 })
  }

  await pool.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2',
    [name.trim(), user.id]
  )

  return NextResponse.json({ success: true, name: name.trim() })
}
