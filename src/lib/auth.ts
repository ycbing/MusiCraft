import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { pool } from "@/db"

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

export async function getUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [session.user.email]
  )
  return rows[0] || null
}

export async function deductCredits(userId: number, amount: number = 1) {
  const { rows } = await pool.query(
    "UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING *",
    [amount, userId]
  )
  await pool.query(
    "INSERT INTO usage_logs (user_id, action, cost) VALUES ($1, $2, $3)",
    [userId, "music_generate", amount]
  )
  return rows[0]
}
