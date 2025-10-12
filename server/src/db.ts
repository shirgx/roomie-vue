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

try {
  db.exec('ALTER TABLE users ADD COLUMN district TEXT')
} catch (error) {
}

try {
  db.exec('ALTER TABLE users ADD COLUMN apartment_description TEXT')
} catch (error) {
}

export type DBUser = {
  id: number
  tg_id: number
  username?: string | null
  full_name?: string | null
  photo_url?: string | null
  local_photo_path?: string | null
  has_apartment?: number | null
  city?: string | null
  district?: string | null
  age?: number | null
  gender?: string | null
  budget_min?: number | null
  budget_max?: number | null
  bio?: string | null
  apartment_description?: string | null
  created_at: string
}
