import Database from 'better-sqlite3'

const db = new Database('app.db')

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  apartment_description TEXT
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

const mockUsers = db.prepare(`SELECT id, full_name FROM users WHERE tg_id BETWEEN 1001 AND 1037`).all()
const questions = db.prepare('SELECT id FROM test_questions ORDER BY id').all().map(q => q.id)

if (questions.length === 0) {
  console.error('Нет вопросов в test_questions. Сначала запусти add-questions.js')
  process.exit(1)
}

const personalityProfiles = [
  [3,1,4,2,3,4,2,3,1,2],
  [2,2,3,1,2,3,1,4,2,1],
  [4,1,2,3,2,4,3,2,2,3],
  [3,2,4,2,1,3,1,3,3,2],
  [4,0,3,2,3,4,4,2,1,4],
  [2,1,4,1,1,3,1,4,4,1],
  [3,1,3,1,2,4,2,3,2,2],
  [4,2,4,3,4,3,4,1,4,3],
  [2,3,2,2,1,2,3,3,2,2],
  [3,0,3,1,2,2,1,4,3,1],
  [4,1,4,2,4,4,3,2,3,3],
  [1,2,2,3,1,3,2,2,1,2],
  [3,3,3,2,3,3,3,3,3,2],
  [2,1,4,1,2,4,2,4,2,1],
  [4,2,3,3,3,3,4,2,4,3],
  [3,1,4,2,2,4,3,3,2,2],
  [2,2,2,1,1,2,1,3,3,1],
  [4,0,4,2,4,4,4,2,4,4],
  [3,2,3,2,2,3,2,3,3,2],
  [2,1,3,1,1,3,1,4,2,1]
]

function generateAnswers(profileIdx) {
  const profile = personalityProfiles[profileIdx % personalityProfiles.length]
  return questions.map((qid, i) => [qid, profile[i % profile.length] ?? 2])
}

console.log(`Найдено мок пользователей: ${mockUsers.length}, вопросов: ${questions.length}`)

const mockIds = mockUsers.map(u => u.id)
if (mockIds.length) {
  db.prepare(`DELETE FROM test_answers WHERE user_id IN (${mockIds.map(()=>'?').join(',')})`).run(...mockIds)
}

const insert = db.prepare('INSERT INTO test_answers (user_id, question_id, answer_index) VALUES (?, ?, ?)')
let total = 0

for (const u of mockUsers) {
  const answers = generateAnswers(u.id)
  const tx = db.transaction(() => {
    for (const [qid, ans] of answers) {
      insert.run(u.id, qid, ans)
      total++
    }
  })
  tx()
  console.log(`${u.full_name}: добавлено ${answers.length} ответов`)
}

console.log(`Всего добавлено ответов: ${total}`)

db.close()
