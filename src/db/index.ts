import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

// pg Pool for raw SQL queries (pool.query('SELECT ...', [params]))
export const pool = new Pool({ connectionString })

// postgres-js client for drizzle ORM
const queryClient = postgres(connectionString, { max: 10 })
export const db = drizzle(queryClient)
export { sql } from 'drizzle-orm'
