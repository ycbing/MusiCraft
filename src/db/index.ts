import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

// pg Pool for all SQL queries
export const pool = new Pool({ connectionString, max: 10 })
