# 🚀 Быстрый деплой Roomie Backend

## Самый простой способ - Heroku

### 1. Подготовка (один раз)
```bash
# Перейдите в папку сервера
cd server

# Установите Heroku CLI (если не установлен)
brew tap heroku/brew && brew install heroku

# Логин в Heroku
heroku login
```

### 2. Настройте переменные окружения
Создайте файл `.env` с вашими данными:
```bash
cp .env.example .env
# Отредактируйте .env файл, добавив ваш TELEGRAM_BOT_TOKEN и ADMIN_TG_ID
```

### 3. Автоматический деплой
```bash
npm run deploy
```

Этот скрипт автоматически:
- Создаст Heroku приложение
- Установит переменные окружения
- Соберет и задеплоит проект
- Покажет URL вашего API

### 4. Проверка
```bash
# Посмотреть логи
npm run logs

# Проверить здоровье API
curl https://your-app-name.herokuapp.com/health
```

## Альтернативные способы

### Railway (очень просто)
1. Зайдите на https://railway.app
2. Подключите GitHub репозиторий
3. Выберите папку `server` как root directory
4. Добавьте переменные окружения в настройках

### Docker
```bash
npm run docker:build
npm run docker:run
```

### VPS с PM2
```bash
npm install -g pm2
npm run build
npm run pm2:start
```

## Что делать после деплоя

1. **Обновите URL API в фронтенде**
   - В файле `src/api/client.ts` измените `VITE_API_URL`

2. **Настройте Telegram Bot**
   - Установите webhook: `/setwebhook https://your-api-url.com/webhook`

3. **Проверьте работу**
   - Откройте `https://your-api-url.com/health`
   - Должен вернуться `{"ok":true}`

## Помощь

При проблемах проверьте:
- Логи: `heroku logs --tail`
- Переменные: `heroku config`
- Статус: `heroku ps`
