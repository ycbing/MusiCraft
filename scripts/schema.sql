-- MusiCraft AI schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  lyrics TEXT NOT NULL DEFAULT '',
  style VARCHAR(50) NOT NULL DEFAULT 'pop',
  mood VARCHAR(50) NOT NULL DEFAULT 'happy',
  language VARCHAR(5) NOT NULL DEFAULT 'zh',
  audio_url TEXT,
  cover_url TEXT,
  duration DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  action VARCHAR(50) NOT NULL,
  cost INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
