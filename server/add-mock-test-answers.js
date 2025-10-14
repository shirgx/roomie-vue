import Database from 'better-sqlite3'

const db = new Database('app.db')

// Получаем всех пользователей
const mockUsers = db.prepare(`SELECT id, full_name FROM users ORDER BY id`).all()
const questions = db.prepare('SELECT id FROM test_questions ORDER BY id').all().map(q => q.id)

if (questions.length === 0) {
  console.error('Нет вопросов в test_questions. Сначала запусти add-questions.js')
  process.exit(1)
}

console.log(`Найдено ${mockUsers.length} пользователей и ${questions.length} вопросов`)

// Расширенные профили личности для разнообразия ответов
const personalityProfiles = [
  [4,1,4,2,4,4,3,2,4,1], // Экстраверт, организованный, открытый
  [2,2,3,1,2,3,1,4,2,1], // Интроверт, добрый, эмоциональный
  [4,1,2,3,2,4,3,2,2,3], // Экстраверт, критичный, стабильный
  [3,2,4,2,1,3,1,3,3,2], // Сбалансированный, ответственный
  [4,0,3,2,3,4,4,2,1,4], // Экстраверт, спонтанный, открытый
  [2,1,4,1,1,3,1,4,4,1], // Интроверт, дисциплинированный
  [1,3,2,4,2,2,2,3,3,2], // Интроверт, тревожный
  [4,2,4,1,4,1,4,1,4,2], // Экстраверт, ответственный, стабильный
  [3,1,3,3,3,3,2,2,2,3], // Сбалансированный профиль
  [2,4,1,4,1,2,1,4,1,4], // Интроверт, критичный, консервативный
  [4,0,4,1,4,4,4,1,4,0], // Очень открытый и общительный
  [1,3,2,4,2,1,2,3,2,3], // Замкнутый, тревожный
  [3,2,3,2,3,3,3,2,3,2], // Средний уровень по всем параметрам
  [4,1,4,0,3,4,4,2,4,1], // Экстраверт, стабильный, открытый
  [2,2,2,3,2,2,1,3,2,3], // Интроверт, сдержанный
  [4,0,3,1,4,3,4,1,3,2], // Экстраверт, открытый к новому
  [1,4,1,4,1,1,1,4,1,4], // Очень интровертный, критичный
  [3,1,4,2,3,2,3,2,3,2], // Сбалансированный, ответственный
  [4,2,4,3,2,4,4,3,2,3], // Экстраверт, немного тревожный
  [2,1,2,2,4,2,2,2,3,1], // Интроверт, открытый к опыту
]

// Функция для генерации случайного профиля на основе базовых
function generateRandomProfile() {
  const baseProfile = personalityProfiles[Math.floor(Math.random() * personalityProfiles.length)]
  return baseProfile.map(answer => {
    // Добавляем небольшую вариативность (±1, но в пределах 0-4)
    const variation = Math.floor(Math.random() * 3) - 1 // -1, 0, или 1
    return Math.max(0, Math.min(4, answer + variation))
  })
}

// Очищаем существующие ответы
db.prepare('DELETE FROM test_answers').run()

// Добавляем ответы для каждого пользователя
const insertAnswer = db.prepare('INSERT OR REPLACE INTO test_answers (user_id, question_id, answer_index) VALUES (?, ?, ?)')

const transaction = db.transaction(() => {
  mockUsers.forEach((user, userIndex) => {
    // Генерируем уникальный профиль для каждого пользователя
    const profile = generateRandomProfile()
    
    questions.forEach((questionId, questionIndex) => {
      const answerIndex = profile[questionIndex]
      insertAnswer.run(user.id, questionId, answerIndex)
    })
    
    console.log(`Добавлены ответы для пользователя: ${user.full_name} (ID: ${user.id})`)
  })
})

try {
  transaction()
  console.log(`Успешно добавлены мок ответы на тест для ${mockUsers.length} пользователей!`)
} catch (error) {
  console.error('Ошибка при добавлении ответов:', error)
}

// Проверяем результат
const totalAnswers = db.prepare('SELECT COUNT(*) as count FROM test_answers').get()
console.log(`Всего ответов в базе: ${totalAnswers.count}`)

db.close()
