import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import multer from 'multer'
import { validate, parse, type InitData } from '@telegram-apps/init-data-node'
import { db, type DBUser } from './db.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.use('/uploads', express.static(path.resolve('uploads')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`
    cb(null, name)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

interface AuthResult {
  initData?: InitData
  isValid: boolean
  error?: string
}

function authenticateRequest(req: express.Request): AuthResult {
  const authHeader = req.header('authorization') || ''
  const [authType, authData = ''] = authHeader.split(' ')
  
  if (authType !== 'tma') {
    if (isDevelopmentMode()) {
      console.log('Development mode: using simplified auth')
      
      return {
        initData: {
          user: {
            id: 999999,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser'
          },
          auth_date: new Date(),
          hash: 'mock_hash'
        } as InitData,
        isValid: true
      }
    }
    
    return {
      isValid: false,
      error: 'Invalid authorization type. Expected "tma"'
    }
  }
  
  if (!authData) {
    return {
      isValid: false,
      error: 'Missing authorization data'
    }
  }
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return {
      isValid: false,
      error: 'Bot token not configured'
    }
  }
  
  try {
    validate(authData, botToken, {
      expiresIn: 3600 // 1 hour
    })
    
    const initData = parse(authData)
    
    return {
      initData,
      isValid: true
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid init data'
    }
  }
}

function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.DEVELOPMENT === 'true' ||
         !process.env.TELEGRAM_BOT_TOKEN
}

function getUserByTgId(tg_id: number): DBUser | undefined {
  return db.prepare('SELECT * FROM users WHERE tg_id = ?').get(tg_id) as any
}

function ensureUserByTgId(initData: InitData): DBUser {
  const tgId = initData.user?.id
  if (!tgId) {
    throw new Error('No user ID in init data')
  }
  
  const existed = getUserByTgId(tgId)
  if (existed) return existed
  
  const userData: any = { tg_id: tgId }
  
  if (initData.user) {
    if (initData.user.username) userData.username = initData.user.username
    if (initData.user.first_name || initData.user.last_name) {
      userData.full_name = [initData.user.first_name, initData.user.last_name].filter(Boolean).join(' ')
    }
    if (initData.user.photo_url) userData.photo_url = initData.user.photo_url
  }
  
  if (tgId === 999999) {
    Object.assign(userData, {
      username: 'testuser',
      full_name: 'Тестовый Пользователь',
      age: 25,
      city: 'Казань',
      gender: 'male',
      has_apartment: 0,
      bio: 'Тестовый пользователь для разработки'
    })
  }
  
  const fields = Object.keys(userData)
  const values = Object.values(userData)
  const placeholders = fields.map(() => '?').join(', ')
  
  db.prepare(`INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`).run(...values)
  
  return getUserByTgId(tgId) as DBUser
}

app.get('/users/me', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const user = ensureUserByTgId(auth.initData)
  
  const totalQuestions = (db.prepare('SELECT COUNT(*) AS c FROM test_questions').get() as any).c
  const answeredQuestions = (db.prepare('SELECT COUNT(*) AS c FROM test_answers WHERE user_id = ?').get(user.id) as any).c
  const testCompleted = totalQuestions > 0 && answeredQuestions >= totalQuestions
  
  res.json({ 
    ...user, 
    auth: true,
    testCompleted: testCompleted
  })
})

app.put('/users/me', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  const {
    full_name,
    city,
    district,
    age,
    gender,
    has_apartment,
    budget_min,
    budget_max,
    bio,
    apartment_description
  } = req.body

  const updateFields: string[] = []
  const updateParams: any[] = []

  if (full_name !== undefined) {
    updateFields.push('full_name = ?')
    updateParams.push(String(full_name).trim() || null)
  }
  if (city !== undefined) {
    updateFields.push('city = ?')
    updateParams.push(String(city).trim() || null)
  }
  if (district !== undefined) {
    updateFields.push('district = ?')
    updateParams.push(String(district).trim() || null)
  }
  if (age !== undefined) {
    updateFields.push('age = ?')
    updateParams.push(Number.isFinite(Number(age)) ? Number(age) : null)
  }
  if (gender !== undefined) {
    updateFields.push('gender = ?')
    updateParams.push(String(gender).trim() || null)
  }
  if (has_apartment !== undefined) {
    updateFields.push('has_apartment = ?')
    updateParams.push(has_apartment ? 1 : 0)
  }
  if (budget_min !== undefined) {
    updateFields.push('budget_min = ?')
    updateParams.push(Number.isFinite(Number(budget_min)) ? Number(budget_min) : null)
  }
  if (budget_max !== undefined) {
    updateFields.push('budget_max = ?')
    updateParams.push(Number.isFinite(Number(budget_max)) ? Number(budget_max) : null)
  }
  if (bio !== undefined) {
    updateFields.push('bio = ?')
    updateParams.push(String(bio).trim() || null)
  }
  if (apartment_description !== undefined) {
    updateFields.push('apartment_description = ?')
    updateParams.push(String(apartment_description).trim() || null)
  }

  if (updateFields.length > 0) {
    updateParams.push(me.id)
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    db.prepare(sql).run(...updateParams)
  }

  const updatedUser = getUserByTgId(me.tg_id)!
  res.json({ ...updatedUser, auth: true })
})

app.post('/users/avatar', upload.single('avatar'), (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  if (!req.file) {
    return res.status(400).json({ error: 'no file uploaded' })
  }

  const photoPath = req.file.filename
  db.prepare('UPDATE users SET local_photo_path = ? WHERE id = ?').run(photoPath, me.id)

  res.json({
    status: 'ok',
    photo_path: photoPath,
    photo_url: `/uploads/${photoPath}`
  })
})

app.post('/search/', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)
  
  const totalQ = (db.prepare('SELECT COUNT(*) AS c FROM test_questions').get() as any).c as number
  const answered = (db.prepare('SELECT COUNT(*) AS c FROM test_answers WHERE user_id = ?').get(me.id) as any).c as number
  if (totalQ > 0 && answered < totalQ) return res.status(403).send('test required')

  const f = req.body || {}
  console.log('=== SEARCH REQUEST ===')
  console.log('Search request filters:', JSON.stringify(f))
  console.log('looking_for_apartment value:', f.looking_for_apartment)
  console.log('looking_for_apartment type:', typeof f.looking_for_apartment)
  
  const conds: string[] = ['u.id != ?']
  const params: any[] = [me.id]
  
  conds.push(`EXISTS (
    SELECT 1 FROM test_answers ta 
    WHERE ta.user_id = u.id 
    GROUP BY ta.user_id 
    HAVING COUNT(*) >= ?
  )`)
  params.push(totalQ)

  if (me.gender) {
    conds.push('u.gender = ?')
    params.push(me.gender)
    console.log(`Applying automatic gender filter: showing only ${me.gender} users`)
  }

  if (f.city) { conds.push('u.city = ?'); params.push(String(f.city)); console.log('Applied city filter:', f.city) }
  if (f.district) { conds.push('u.district = ?'); params.push(String(f.district)); console.log('Applied district filter:', f.district) }
  if (Number.isFinite(Number(f.age_min))) { conds.push('u.age >= ?'); params.push(Number(f.age_min)); console.log('Applied age_min filter:', f.age_min) }
  if (Number.isFinite(Number(f.age_max))) { conds.push('u.age <= ?'); params.push(Number(f.age_max)); console.log('Applied age_max filter:', f.age_max) }
  if (Number.isFinite(Number(f.budget_min))) { conds.push('(u.budget_min IS NULL OR u.budget_min >= ?)'); params.push(Number(f.budget_min)); console.log('Applied budget_min filter:', f.budget_min) }
  if (Number.isFinite(Number(f.budget_max))) { conds.push('(u.budget_max IS NULL OR u.budget_max <= ?)'); params.push(Number(f.budget_max)); console.log('Applied budget_max filter:', f.budget_max) }
  
  if (typeof f.looking_for_apartment === 'boolean' && f.looking_for_apartment === true) { 
    conds.push('u.has_apartment = 1'); 
    console.log('✓ Applying filter: looking for apartment - showing only users WITH apartments');
  } else {
    console.log('✗ NOT applying looking_for_apartment filter. Value:', f.looking_for_apartment, 'Type:', typeof f.looking_for_apartment)
  }
  
  if (typeof f.has_apartment === 'boolean' && f.has_apartment === true) { 
    conds.push('u.has_apartment = 1'); 
    console.log('Applying filter: has_apartment = true - showing only users WITH apartments');
  }

  const sql = `SELECT u.id, u.tg_id, u.username, u.full_name, u.local_photo_path, u.photo_url, 
               u.has_apartment, u.city, u.district, u.age, u.gender, u.budget_min, u.budget_max, u.bio, u.apartment_description
               FROM users u
               WHERE ${conds.join(' AND ')}
               LIMIT 100`
  console.log('Search SQL:', sql)
  console.log('Search params:', params)
  
  const rows = db.prepare(sql).all(...params) as DBUser[]
  console.log(`Found ${rows.length} users before compatibility calculation`)
  console.log('=== END SEARCH REQUEST ===')

  const usersWithCompatibility = rows.map(r => {
    const compatibility = calculateCompatibility(me.id, r.id)
    return {
      id: r.id,
      tg_id: r.tg_id,
      username: r.username || undefined,
      full_name: r.full_name || undefined,
      local_photo_path: r.local_photo_path || undefined,
      photo_url: r.photo_url || undefined,
      has_apartment: !!r.has_apartment,
      city: r.city || undefined,
      district: r.district || undefined,
      age: r.age || undefined,
      gender: r.gender || undefined,
      budget_min: r.budget_min || undefined,
      budget_max: r.budget_max || undefined,
      bio: r.bio || undefined,
      apartment_description: r.apartment_description || undefined,
      compatibility_percentage: compatibility
    }
  })
  
  usersWithCompatibility.sort((a, b) => b.compatibility_percentage - a.compatibility_percentage)
  
  console.log('Users sorted by compatibility:', usersWithCompatibility.map(u => ({
    name: u.full_name,
    compatibility: u.compatibility_percentage
  })))
  
  const data = usersWithCompatibility.slice(0, 50)
  
  res.json(data)
})

app.post('/likes/', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)
  const to_user_id = Number(req.body?.to_user_id)
  const is_like = !!req.body?.is_like
  if (!Number.isFinite(to_user_id)) return res.status(400).send('bad to_user_id')
  db.prepare('INSERT OR REPLACE INTO likes (from_user_id, to_user_id, is_like) VALUES (?, ?, ?)')
    .run(me.id, to_user_id, is_like ? 1 : 0)
  res.json({ status: 'ok' })
})

app.get('/tests/questions', (req, res) => {
  const rows = db.prepare('SELECT id, title, type, answers_json FROM test_questions').all() as any[]
  const data = rows.map(r => ({
    id: r.id,
    title: r.title,
    type: r.type,
    answers: (JSON.parse(r.answers_json) as string[]).map((text, idx) => ({ id: idx, text })),
  }))
  res.json(data)
})

app.post('/tests/submit', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)
  const answers = (req.body?.answers || []) as Array<[number, number]>
  
  console.log('Test submission received:')
  console.log('User ID:', me.id)
  console.log('Raw request body:', JSON.stringify(req.body, null, 2))
  console.log('Parsed answers:', answers)
  
  if (!Array.isArray(answers)) {
    console.log('Error: answers is not an array')
    return res.status(400).send('bad payload')
  }

  const del = db.prepare('DELETE FROM test_answers WHERE user_id = ?')
  const ins = db.prepare('INSERT INTO test_answers (user_id, question_id, answer_index) VALUES (?, ?, ?)')
  
  let insertedCount = 0
  const tx = db.transaction(() => {
    del.run(me.id)
    for (const pair of answers) {
      const [qid, aidx] = pair
      console.log(`Processing answer: qid=${qid}, aidx=${aidx}, qid_finite=${Number.isFinite(qid)}, aidx_finite=${Number.isFinite(aidx)}`)
      
      if (!Number.isFinite(qid) || !Number.isFinite(aidx)) {
        console.log(`Skipping invalid answer: qid=${qid}, aidx=${aidx}`)
        continue
      }
      
      ins.run(me.id, qid, aidx)
      insertedCount++
      console.log(`Inserted answer: user_id=${me.id}, question_id=${qid}, answer_index=${aidx}`)
    }
  })
  tx()
  
  console.log(`Total answers inserted: ${insertedCount}`)
  res.json({ status: 'ok', inserted: insertedCount })
})
app.get('/tests/status', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const user = ensureUserByTgId(auth.initData)

  const totalQuestions = (db.prepare('SELECT COUNT(*) AS c FROM test_questions').get() as any).c
  const answeredQuestions = (db.prepare('SELECT COUNT(*) AS c FROM test_answers WHERE user_id = ?').get(user.id) as any).c
  
  res.json({
    questionCount: totalQuestions,
    answeredCount: answeredQuestions,
    isCompleted: totalQuestions > 0 && answeredQuestions >= totalQuestions
  })
})

app.get('/tests/my-answers', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const user = ensureUserByTgId(auth.initData)

  const answers = db.prepare(`
    SELECT question_id, answer_index 
    FROM test_answers 
    WHERE user_id = ? 
    ORDER BY question_id
  `).all(user.id) as Array<{question_id: number, answer_index: number}>

  const answersMap = answers.reduce((acc, answer) => {
    acc[answer.question_id] = answer.answer_index
    return acc
  }, {} as Record<number, number>)

  res.json(answersMap)
})

app.get('/likes/matches', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  const sql = `
    SELECT u.id, u.tg_id, u.username, u.full_name, u.local_photo_path, u.photo_url, 
           u.city, u.age, u.gender, u.bio, l1.created_at as matched_at
    FROM users u
    INNER JOIN likes l1 ON l1.to_user_id = u.id AND l1.from_user_id = ? AND l1.is_like = 1
    INNER JOIN likes l2 ON l2.from_user_id = u.id AND l2.to_user_id = ? AND l2.is_like = 1
    ORDER BY l1.created_at DESC
  `
  const matches = db.prepare(sql).all(me.id, me.id) as any[]

  const data = matches.map(m => ({
    id: m.id,
    tg_id: m.tg_id,
    username: m.username || undefined,
    full_name: m.full_name || undefined,
    local_photo_path: m.local_photo_path || undefined,
    photo_url: m.photo_url || undefined,
    city: m.city || undefined,
    age: m.age || undefined,
    gender: m.gender || undefined,
    bio: m.bio || undefined,
    matched_at: m.matched_at,
    compatibility_percentage: calculateCompatibility(me.id, m.id)
  }))

  res.json(data)
})

app.get('/likes/sent', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  const sql = `
    SELECT u.id, u.tg_id, u.username, u.full_name, u.local_photo_path, u.photo_url,
           u.city, u.age, u.gender, u.bio, l.is_like, l.created_at
    FROM users u
    INNER JOIN likes l ON l.to_user_id = u.id AND l.from_user_id = ?
    ORDER BY l.created_at DESC
    LIMIT 100
  `
  const likes = db.prepare(sql).all(me.id) as any[]

  const data = likes.map(l => ({
    id: l.id,
    tg_id: l.tg_id,
    username: l.username || undefined,
    full_name: l.full_name || undefined,
    local_photo_path: l.local_photo_path || undefined,
    photo_url: l.photo_url || undefined,
    city: l.city || undefined,
    age: l.age || undefined,
    gender: l.gender || undefined,
    bio: l.bio || undefined,
    is_like: !!l.is_like,
    created_at: l.created_at
  }))

  res.json(data)
})

app.get('/likes/received', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  const sql = `
    SELECT u.id, u.tg_id, u.username, u.full_name, u.local_photo_path, u.photo_url,
           u.city, u.age, u.gender, u.bio, l.is_like, l.created_at
    FROM users u
    INNER JOIN likes l ON l.from_user_id = u.id AND l.to_user_id = ? AND l.is_like = 1
    ORDER BY l.created_at DESC
    LIMIT 100
  `
  const likes = db.prepare(sql).all(me.id) as any[]

  const data = likes.map(l => ({
    id: l.id,
    tg_id: l.tg_id,
    username: l.username || undefined,
    full_name: l.full_name || undefined,
    local_photo_path: l.local_photo_path || undefined,
    photo_url: l.photo_url || undefined,
    city: l.city || undefined,
    age: l.age || undefined,
    gender: l.gender || undefined,
    bio: l.bio || undefined,
    created_at: l.created_at
  }))

  res.json(data)
})

app.get('/users/:id', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }

  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'invalid user id' })
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as DBUser | undefined
  if (!user) {
    return res.status(404).json({ error: 'user not found' })
  }

  const data = {
    id: user.id,
    tg_id: user.tg_id,
    username: user.username || undefined,
    full_name: user.full_name || undefined,
    local_photo_path: user.local_photo_path || undefined,
    photo_url: user.photo_url || undefined,
    has_apartment: !!user.has_apartment,
    city: user.city || undefined,
    age: user.age || undefined,
    gender: user.gender || undefined,
    budget_min: user.budget_min || undefined,
    budget_max: user.budget_max || undefined,
    bio: user.bio || undefined,
    apartment_description: user.apartment_description || undefined,
  }

  res.json(data)
})

app.delete('/admin/users/:id', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const adminId = parseInt(process.env.ADMIN_TG_ID || '0')
  if (!adminId || !auth.initData.user || auth.initData.user.id !== adminId) {
    return res.status(403).json({ error: 'admin access required' })
  }

  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'invalid user id' })
  }

  const deleteUser = db.prepare('DELETE FROM users WHERE id = ?')
  const deleteLikes = db.prepare('DELETE FROM likes WHERE from_user_id = ? OR to_user_id = ?')
  const deleteAnswers = db.prepare('DELETE FROM test_answers WHERE user_id = ?')
  
  const tx = db.transaction(() => {
    deleteLikes.run(userId, userId)
    deleteAnswers.run(userId)
    deleteUser.run(userId)
  })
  tx()

  res.json({ status: 'deleted' })
})

app.get('/admin/stats', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const adminId = parseInt(process.env.ADMIN_TG_ID || '0')
  if (!adminId || !auth.initData.user || auth.initData.user.id !== adminId) {
    return res.status(403).json({ error: 'admin access required' })
  }

  const totalUsers = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as any).c
  const totalQuestions = (db.prepare('SELECT COUNT(*) AS c FROM test_questions').get() as any).c
  const testCompletedUsers = (db.prepare(`
    SELECT COUNT(DISTINCT user_id) AS c 
    FROM test_answers 
    WHERE user_id IN (
      SELECT user_id 
      FROM test_answers 
      GROUP BY user_id 
      HAVING COUNT(*) >= ?
    )
  `).get(totalQuestions) as any).c
  
  const totalLikes = (db.prepare('SELECT COUNT(*) AS c FROM likes WHERE is_like = 1').get() as any).c
  const totalMatches = (db.prepare(`
    SELECT COUNT(*) AS c FROM (
      SELECT l1.from_user_id, l1.to_user_id
      FROM likes l1
      INNER JOIN likes l2 ON l1.from_user_id = l2.to_user_id AND l1.to_user_id = l2.from_user_id
      WHERE l1.is_like = 1 AND l2.is_like = 1
      AND l1.from_user_id < l1.to_user_id
    )
  `).get() as any).c
  
  const avgAge = (db.prepare('SELECT AVG(age) AS avg FROM users WHERE age IS NOT NULL').get() as any).avg || 0
  
  const topCities = db.prepare(`
    SELECT city, COUNT(*) as count 
    FROM users 
    WHERE city IS NOT NULL 
    GROUP BY city 
    ORDER BY count DESC 
    LIMIT 5
  `).all() as any[]

  res.json({
    totalUsers,
    activeUsers: totalUsers,
    testCompletedUsers,
    totalLikes,
    totalMatches,
    averageAge: Math.round(avgAge * 10) / 10,
    topCities: topCities.map(c => ({ city: c.city, count: c.count }))
  })
})

app.delete('/admin/users/:id/test', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }

  const adminId = parseInt(process.env.ADMIN_TG_ID || '0')
  if (!adminId || !auth.initData.user || auth.initData.user.id !== adminId) {
    return res.status(403).json({ error: 'admin access required' })
  }

  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'invalid user id' })
  }

  db.prepare('DELETE FROM test_answers WHERE user_id = ?').run(userId)
  res.json({ status: 'test reset' })
})

app.delete('/users/me', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  db.prepare('DELETE FROM test_answers WHERE user_id = ?').run(me.id)
  db.prepare('DELETE FROM likes WHERE from_user_id = ? OR to_user_id = ?').run(me.id, me.id)
  db.prepare('DELETE FROM users WHERE id = ?').run(me.id)

  res.json({ status: 'account deleted' })
})

app.delete('/users/me/test', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  db.prepare('DELETE FROM test_answers WHERE user_id = ?').run(me.id)
  res.json({ status: 'test reset' })
})

app.get('/health', (_req, res) => res.json({ ok: true }))

const PORT = Number(process.env.PORT || 3000)
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})

function calculateCompatibility(user1Id: number, user2Id: number): number {
  const user1Answers = db.prepare(`
    SELECT question_id, answer_index 
    FROM test_answers 
    WHERE user_id = ? 
    ORDER BY question_id
  `).all(user1Id) as Array<{question_id: number, answer_index: number}>

  const user2Answers = db.prepare(`
    SELECT question_id, answer_index 
    FROM test_answers 
    WHERE user_id = ? 
    ORDER BY question_id
  `).all(user2Id) as Array<{question_id: number, answer_index: number}>

  if (user1Answers.length === 0 || user2Answers.length === 0) {
    return 0 
  }
  
  const user1Map = new Map(user1Answers.map(a => [a.question_id, a.answer_index]))
  const user2Map = new Map(user2Answers.map(a => [a.question_id, a.answer_index]))

  let totalQuestions = 0
  let compatibleAnswers = 0
  
  for (const [questionId, user1Answer] of user1Map) {
    const user2Answer = user2Map.get(questionId)
    if (user2Answer !== undefined) {
      totalQuestions++
      
      const compatibility = getAnswerCompatibility(questionId, user1Answer, user2Answer)
      compatibleAnswers += compatibility
    }
  }

  return totalQuestions > 0 ? Math.round((compatibleAnswers / totalQuestions) * 100) : 0
}

function getAnswerCompatibility(questionId: number, answer1: number, answer2: number): number {
  if (answer1 === answer2) return 1.0
  
  const difference = Math.abs(answer1 - answer2)
  
  const questionIndex = questionId - 9
  
  switch (questionIndex) {
    case 1: 
      if (difference === 1) return 0.8
      if (difference === 2) return 0.6
      if (difference === 3) return 0.3
      if (difference === 4) return 0.1
      break

    case 2: 
      if (difference === 1) return 0.7
      if (difference === 2) return 0.5
      if (difference === 3) return 0.6 
      if (difference === 4) return 0.2
      break

    case 3: 
      if (difference === 1) return 0.8
      if (difference === 2) return 0.5
      if (difference === 3) return 0.3
      if (difference === 4) return 0.1
      break

    case 4:
      if (difference === 1) return 0.7
      if (difference === 2) return 0.8 
      if (difference === 3) return 0.6
      if (difference === 4) return 0.3
      break

    case 5:
      if (difference === 1) return 0.8
      if (difference === 2) return 0.6
      if (difference === 3) return 0.4
      if (difference === 4) return 0.2
      break

    case 6: 
      if (difference === 1) return 0.7
      if (difference === 2) return 0.8
      if (difference === 3) return 0.5
      if (difference === 4) return 0.3
      break

    case 7:
      if (difference === 1) return 0.9
      if (difference === 2) return 0.7
      if (difference === 3) return 0.4
      if (difference === 4) return 0.2
      break

    case 8: 
      if (difference === 1) return 0.8
      if (difference === 2) return 0.9
      if (difference === 3) return 0.6
      if (difference === 4) return 0.3
      break

    case 9: 
      if (difference === 1) return 0.8
      if (difference === 2) return 0.6
      if (difference === 3) return 0.4
      if (difference === 4) return 0.1
      break

    case 10: 
      if (difference === 1) return 0.7
      if (difference === 2) return 0.8
      if (difference === 3) return 0.5
      if (difference === 4) return 0.3
      break

    default:
      if (difference === 1) return 0.7
      if (difference === 2) return 0.5
      if (difference === 3) return 0.3
      if (difference === 4) return 0.1
  }

  return 0.5
}

app.get('/users/:id/compatibility', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const me = ensureUserByTgId(auth.initData)

  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'invalid user id' })
  }

  const compatibility = calculateCompatibility(me.id, userId)
  res.json({ 
    user_id: userId,
    compatibility_percentage: compatibility 
  })
})

const MOCK_USERS = [
  { tg_id: 1001, username: 'anna_kazan', full_name: 'Анна Петрова', photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face', has_apartment: 0, city: 'Казань', district: 'Вахитовский', age: 23, gender: 'female', budget_min: 15000, budget_max: 25000, bio: 'Студентка КФУ, изучаю психологию. Ищу соседку для совместной аренды в центре города. Люблю читать, готовить и смотреть фильмы.', apartment_description: 'Ищу уютную двухкомнатную квартиру в центре города, желательно с отдельными спальнями. Важно наличие хорошей кухни для готовки и тихий район для учебы.' },
  { tg_id: 1002, username: 'dmitriy_tech', full_name: 'Дмитрий Соколов', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', has_apartment: 1, city: 'Казань', district: 'Ново-Савиновский', age: 28, gender: 'male', budget_min: 0, budget_max: 0, bio: 'IT-разработчик, есть двухкомнатная квартира в новостройке. Ищу соседа, который разделит коммунальные расходы. Работаю удаленно, не курю.', apartment_description: 'Просторная двухкомнатная квартира 65 кв.м в новом доме. Современный ремонт, есть балкон, парковка, охрана. Отдельная комната 18 кв.м для соседа с большим окном. Рядом торговый центр и метро.' },
  { tg_id: 1003, username: 'maria_student', full_name: 'Мария Иванова', photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', has_apartment: 0, city: 'Казань', district: 'Советский', age: 21, gender: 'female', budget_min: 12000, budget_max: 20000, bio: 'Студентка медицинского университета. Серьезно отношусь к учебе, но люблю веселиться в свободное время. Ищу девушку для совместного проживания.', apartment_description: 'Хочу снять однокомнатную или двухкомнатную квартиру недалеко от медицинского университета. Главное - хорошее освещение для учебы и тишина ночью.' },
  { tg_id: 1004, username: 'alex_moscow', full_name: 'Александр Волков', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', has_apartment: 0, city: 'Москва', district: '', age: 26, gender: 'male', budget_min: 30000, budget_max: 50000, bio: 'Маркетолог, переехал в Москву по работе. Ищу квартиру и соседа в районе метро. Занимаюсь спортом, не конфликтный, за порядок.', apartment_description: 'Ищу современную квартиру в хорошем районе Москвы, обязательно рядом с метро. Важна развитая инфраструктура: спортзал, магазины, кафе. Готов рассмотреть как студию, так и многокомнатную квартиру.' },
  { tg_id: 1005, username: 'elena_design', full_name: 'Елена Смирнова', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', has_apartment: 1, city: 'Санкт-Петербург', district: '', age: 25, gender: 'female', budget_min: 0, budget_max: 0, bio: 'Графический дизайнер, фрилансер. Есть уютная квартира в историческом центре. Ищу творческого соседа, который ценит искусство и атмосферу города.', apartment_description: 'Трехкомнатная квартира в старом фонде на Петроградской стороне. Высокие потолки, лепнина, паркет. Есть мастерская для творчества. Сдаю большую светлую комнату 20 кв.м с видом на Неву. Очень атмосферное место!' },
  { tg_id: 1006, username: 'ivan_student', full_name: 'Иван Морозов', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', has_apartment: 0, city: 'Казань', district: 'Авиастроительный', age: 22, gender: 'male', budget_min: 10000, budget_max: 18000, bio: 'Студент технического университета, изучаю авиастроение. Тихий, учусь на отлично. Ищу такого же серьезного соседа для совместной аренды.', apartment_description: 'Рассматриваю варианты в районе КНИТУ-КАИ. Нужна тихая обстановка для учебы, желательно отдельная комната. Не против общежития или съемной квартиры, главное - адекватные соседи и близость к университету.' },
  { tg_id: 1007, username: 'oksana_teacher', full_name: 'Оксана Белова', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', has_apartment: 1, city: 'Екатеринбург', district: '', age: 29, gender: 'female', budget_min: 0, budget_max: 0, bio: 'Учитель английского языка, есть просторная квартира рядом со школой. Ищу ответственную соседку, желательно тоже из сферы образования.', apartment_description: 'Двухкомнатная квартира в тихом районе, 10 минут пешком до центра. Меблированная комната 16 кв.м, есть рабочее место. В квартире порядок и уют, много книг. Ищу соседку, которая ценит чистоту и тишину.' }
]

function resetToMockUsers() {
  const delLikes = db.prepare('DELETE FROM likes')
  const delAnswers = db.prepare('DELETE FROM test_answers')
  const delUsers = db.prepare('DELETE FROM users')
  const insert = db.prepare(`INSERT INTO users (tg_id, username, full_name, photo_url, has_apartment, city, district, age, gender, budget_min, budget_max, bio, apartment_description)
    VALUES (@tg_id, @username, @full_name, @photo_url, @has_apartment, @city, @district, @age, @gender, @budget_min, @budget_max, @bio, @apartment_description)`)

  const tx = db.transaction(() => {
    delLikes.run()
    delAnswers.run()
    delUsers.run()
    for (const u of MOCK_USERS) insert.run(u)
  })
  tx()
  return { inserted: MOCK_USERS.length }
}

import fs from 'node:fs'

app.post('/admin/reset-mocks', (req, res) => {
  const auth = authenticateRequest(req)
  
  if (!auth.isValid || !auth.initData) {
    return res.status(401).json({ error: auth.error || 'Authentication failed' })
  }
  
  const adminId = parseInt(process.env.ADMIN_TG_ID || '0')
  if (!adminId || !auth.initData.user || auth.initData.user.id !== adminId) {
    return res.status(403).json({ error: 'admin access required' })
  }
  
  try {
    const upDir = path.resolve('uploads')
    if (fs.existsSync(upDir)) {
      for (const f of fs.readdirSync(upDir)) {
        if (f.startsWith('avatar_')) {
          try { fs.unlinkSync(path.join(upDir, f)) } catch {}
        }
      }
    }
  } catch (e) {
    console.warn('Failed to clean uploads:', e)
  }

  try {
    const result = resetToMockUsers()
    res.json({ status: 'ok', ...result })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' })
  }
})
