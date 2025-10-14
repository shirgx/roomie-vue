import Database from 'better-sqlite3';

const db = new Database('./app.db');

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
`);

db.prepare('DELETE FROM test_questions').run();

const questions = [
  {
    title: "Я открытый к общению человек",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Обычно я критично отношусь к другим, испытываю желание поспорить",
    type: "personality", 
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Меня можно назвать ответственным, дисциплинированным человеком",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Я легко расстраиваюсь и тревожусь",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Я многосторонний человек, открыт новому опыту",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "В общении с людьми я стараюсь не проявлять истинные эмоции",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Про меня можно сказать, что я сочувствующий и добросердечный человек",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Мои действия скорее спонтанные, чем последовательные",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Я отношу себя к эмоционально стабильным и спокойным людям",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  },
  {
    title: "Можно сказать, что я консервативный, тяжело принимающий новое",
    type: "personality",
    answers: ["Точно нет", "Скорее нет", "Нейтрально", "Скорее да", "Точно да"]
  }
];

const insertQuestion = db.prepare('INSERT INTO test_questions (title, type, answers_json) VALUES (?, ?, ?)');

questions.forEach((q, index) => {
  insertQuestion.run(q.title, q.type, JSON.stringify(q.answers));
  console.log(`Добавлен вопрос ${index + 1}: ${q.title}`);
});

console.log(`\nВсего добавлено ${questions.length} вопросов`);

const count = db.prepare('SELECT COUNT(*) as count FROM test_questions').get();
console.log(`В базе данных теперь ${count.count} вопросов`);

db.close();
