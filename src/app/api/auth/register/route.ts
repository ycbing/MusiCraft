import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { pool } from '@/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Check existing
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with 50 free credits
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, credits) VALUES ($1, $2, $3, 50) RETURNING id, name, email, credits',
      [name || email.split('@')[0], email, hashedPassword]
    )

    return NextResponse.json({ user: rows[0] }, { status: 201 })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
