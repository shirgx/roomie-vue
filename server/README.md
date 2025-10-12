# Roomie Telegram Mini App Backend

Современный бэкенд для Telegram Mini App поиска соседей, построенный с нуля с использованием новых инструментов Telegram.

## 🚀 Особенности

- **Telegram Mini App Integration** - Полная интеграция с Telegram WebApp API
- **Безопасная аутентификация** - Валидация init data от Telegram
- **Моковые данные** - Готовые тестовые данные для разработки
- **Система совместимости** - Алгоритм подбора на основе тестирования
- **Rate Limiting** - Защита от спама и злоупотреблений
- **TypeScript** - Полная типизация для безопасности
- **Modern Stack** - Express.js, Zod валидация, современные инструменты

## 📋 API Endpoints

### Пользователи
- `GET /api/users/me` - Получить текущего пользователя
- `PUT /api/users/me` - Обновить профиль
- `GET /api/users/stats` - Статистика пользователя
- `GET /api/users/search` - Поиск пользователей
- `GET /api/users/:userId` - Получить пользователя по ID

### Лайки и матчи
- `POST /api/matches/like` - Лайкнуть/дизлайкнуть пользователя
- `GET /api/matches` - Получить матчи
- `GET /api/matches/potential` - Потенциальные матчи для свайпа
- `GET /api/matches/:matchId` - Детали матча
- `GET /api/likes` - История лайков

### Тест совместимости
- `GET /api/test/questions` - Все вопросы теста
- `POST /api/test/answer` - Ответить на вопрос
- `POST /api/test/submit` - Отправить весь тест
- `GET /api/test/progress` - Прогресс теста
- `GET /api/test/compatibility/:userId` - Совместимость с пользователем

## 🛠 Установка и запуск

1. **Клонируйте и установите зависимости:**
```bash
cd server
npm install
```

2. **Настройте окружение:**
```bash
cp .env.example .env
# Отредактируйте .env файл
```

3. **Запустите в режиме разработки:**
```bash
npm run dev
```

4. **Соберите для продакшена:**
```bash
npm run build
npm start
```

## 🔧 Конфигурация

### Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Настройте Menu Button для запуска Mini App
4. Укажите URL вашего веб-приложения

### Переменные окружения

```env
# Обязательные для продакшена
TELEGRAM_BOT_TOKEN=your_bot_token
WEBAPP_URL=https://your-app.com

# Опциональные
NODE_ENV=production
PORT=3000
ENABLE_MOCK=false
```

## 🏗 Архитектура

```
src/
├── config/          # Конфигурация приложения
├── controllers/     # HTTP контроллеры
├── data/           # Моковые данные
├── middleware/     # Express middleware
├── routes/         # API маршруты
├── services/       # Бизнес логика
├── types/          # TypeScript типы
├── utils/          # Утилиты
└── index.ts        # Точка входа
```

## 📱 Telegram Mini App Features

- **Валидация init data** - Проверка подлинности данных от Telegram
- **Автоматическое создание пользователей** - Из данных Telegram профиля
- **Поддержка тем** - Light/Dark mode
- **Адаптивный дизайн** - Под размеры Telegram
- **Безопасность** - CORS, Helmet, Rate limiting

## 🧪 Тестовые данные

В режиме разработки доступны:
- 5 тестовых пользователей с разными профилями
- Готовые вопросы для теста совместимости
- Примеры лайков и матчей
- Статистика пользователей

## 🔒 Безопасность

- Валидация всех входящих данных через Zod
- Проверка подлинности init data от Telegram
- Rate limiting для защиты от спама
- CORS настройки для безопасности
- Helmet для безопасности заголовков

## 📊 Мониторинг

- Структурированное логирование
- Health check endpoint: `/health`
- Метрики пользователей (просмотры, лайки, матчи)

## 🚦 Статусы ответов

```json
{
  "success": true,
  "data": {...},
  "total": 10
}
```

Ошибки:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

## 📝 Примеры использования

### Аутентификация
```javascript
// Заголовок запроса
Authorization: tma <initData>
```

### Лайк пользователя
```javascript
POST /api/matches/like
{
  "toUserId": "user_id",
  "isLike": true
}
```

### Ответ на вопрос теста
```javascript
POST /api/test/answer
{
  "questionId": "question_id", 
  "answers": [2]
}
```

## 🔄 Развертывание

Поддерживает развертывание на:
- Railway
- Vercel
- Heroku
- любой VPS с Node.js

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request
