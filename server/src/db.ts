import Database from 'better-sqlite3'

export const db = new Database('app.db')
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tg_id INTEGER UNIQUE,
  username TEXT,
  full_name TEXT,
  photo_url TEXT,
  local_photo_path TEXT,
  has_apartment INTEGER,
  city TEXT,
  district TEXT,
  age INTEGER,
  gender TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  bio TEXT,
  apartment_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS likes (
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  is_like INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (from_user_id, to_user_id)
);
CREATE TABLE IF NOT EXISTS test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  answers_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS test_answers (
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id)
);
`)

// Add columns if they don't exist (for backward compatibility)
try {
  db.exec('ALTER TABLE users ADD COLUMN district TEXT')
} catch (error) {
  // Column already exists
}

try {
  db.exec('ALTER TABLE users ADD COLUMN apartment_description TEXT')
} catch (error) {
  // Column already exists
}

export interface DBUser {
  id: number
  tg_id: number
  username?: string
  full_name?: string
  photo_url?: string
  local_photo_path?: string
  has_apartment: number
  city?: string
  district?: string
  age?: number
  gender?: string
  budget_min?: number
  budget_max?: number
  bio?: string
  apartment_description?: string
  created_at: string
}
