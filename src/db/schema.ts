import {
  pgTable, serial, text, integer, timestamp, varchar, decimal,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  credits: integer('credits').default(50).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
})

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  expires: timestamp('expires').notNull(),
})

export const songs = pgTable('songs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  lyrics: text('lyrics').notNull().default(''),
  style: varchar('style', { length: 50 }).notNull().default('pop'),
  mood: varchar('mood', { length: 50 }).notNull().default('happy'),
  language: varchar('language', { length: 5 }).notNull().default('zh'),
  audioUrl: text('audio_url'),
  coverUrl: text('cover_url'),
  duration: decimal('duration', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  shareToken: text('share_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usageLogs = pgTable('usage_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  cost: integer('cost').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
