import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// Ensure `apartment_description` column exists (SQLite doesn't support IF NOT EXISTS for ADD COLUMN)
try {
  db.exec('ALTER TABLE users ADD COLUMN apartment_description TEXT')
} catch (err) {
  // ignore if column already exists
}

// Коллекция фотографий для женщин
const femalePhotos = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559548331-f9cb98001426?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824694996-65274cd88d88?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1616091216791-4f5b5b7c1f8c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face'
]

// Коллекция фотографий для мужчин
const malePhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1592334873219-42ca023ed430?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1600481176431-47ad2ab2745d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1624561172888-ac93c696aba0?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1636041293178-808a6762ab39?w=400&h=400&fit=crop&crop=face'
]

// Функция для получения случайной фотографии по полу
function getRandomPhotoByGender(gender, usedPhotos = new Set()) {
  const photos = gender === 'female' ? femalePhotos : malePhotos
  const availablePhotos = photos.filter(photo => !usedPhotos.has(photo))
  
  if (availablePhotos.length === 0) {
    // Если все фотографии использованы, берем случайную из всех
    return photos[Math.floor(Math.random() * photos.length)]
  }
  
  const selectedPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)]
  usedPhotos.add(selectedPhoto)
  return selectedPhoto
}

// New mock users: only from Казань, Уфа, Челябинск, Москва, Екатеринбург
// Kazan users will have district set (various districts). Budgets are multiples of 500.
function randMultipleOf(step, min, max) {
  const steps = Math.floor((max - min) / step) + 1
  return min + Math.floor(Math.random() * steps) * step
}

const kazanDistrictsForMock = ['Вахитовский','Авиастроительный','Кировский','Приволжский','Московский','Ново-Савиновский','Советский']

const mockUsers = []
let nextTg = 1001

// helper to push user
function addUser({username, full_name, city, district = '', age = 24, gender = 'female', has_apartment = 0, bio = '', apartment_description = null, budget_min = null, budget_max = null}){
  // budgets: if null and user has no apartment -> pick random multiples of 500; if has_apartment -> 0
  if (has_apartment) {
    budget_min = 0
    budget_max = 0
  } else {
    if (budget_min == null) budget_min = randMultipleOf(500, 5000, 25000)
    if (budget_max == null) budget_max = Math.max(budget_min + 500, randMultipleOf(500, budget_min + 500, Math.max(25000, budget_min + 500)))
  }

  mockUsers.push({
    tg_id: nextTg++,
    username,
    full_name,
    has_apartment: has_apartment ? 1 : 0,
    city,
    district: city === 'Казань' ? district || kazanDistrictsForMock[Math.floor(Math.random()*kazanDistrictsForMock.length)] : '',
    age,
    gender,
    budget_min,
    budget_max,
    bio: bio || (has_apartment ? 'Есть квартира, ищу соседа.' : 'Ищу квартиру и соседа.'),
    apartment_description: has_apartment ? (apartment_description || 'Уютная квартира с хорошим ремонтом') : null
  })
}

// Make a balanced set: per city create several users; Kazan users use different districts
const citiesForMocks = ['Казань','Уфа','Челябинск','Москва','Екатеринбург']

// Add explicit varied users
addUser({username: 'anna_kzn', full_name: 'Анна Казанова', city: 'Казань', district: 'Вахитовский', age: 23, gender: 'female', has_apartment: 0, budget_min: 1500*10, budget_max: 2500*10})
addUser({username: 'dmitriy_kzn', full_name: 'Дмитрий Казанцев', city: 'Казань', district: 'Ново-Савиновский', age: 28, gender: 'male', has_apartment: 1, apartment_description: 'Двухкомнатная квартира в новостройке'})
addUser({username: 'maria_kzn', full_name: 'Мария Петрова', city: 'Казань', district: 'Советский', age: 21, gender: 'female', has_apartment: 0, budget_min: 12000, budget_max: 18000})
addUser({username: 'ivan_kzn', full_name: 'Иван Морозов', city: 'Казань', district: 'Авиастроительный', age: 22, gender: 'male', has_apartment: 0, budget_min: 10000, budget_max: 15000})
addUser({username: 'oksana_ekb', full_name: 'Оксана Белова', city: 'Екатеринбург', age: 29, gender: 'female', has_apartment: 1, apartment_description: 'Однокомнатная в центре'})
addUser({username: 'alex_msc', full_name: 'Алексей Смирнов', city: 'Москва', age: 26, gender: 'male', has_apartment: 0, budget_min: 30000, budget_max: 40000})
addUser({username: 'elena_ufa', full_name: 'Елена Уфимская', city: 'Уфа', age: 25, gender: 'female', has_apartment: 1, apartment_description: 'Уютная квартира в спальном районе'})
addUser({username: 'roman_chel', full_name: 'Роман Челнин', city: 'Челябинск', age: 27, gender: 'male', has_apartment: 0, budget_min: 20000, budget_max: 30000})
addUser({username: 'liza_msc', full_name: 'Елизавета Артемьева', city: 'Москва', age: 26, gender: 'female', has_apartment: 1, apartment_description: 'Большая комната в трехкомнатной квартире'})
addUser({username: 'sergey_kzn', full_name: 'Сергей Николаев', city: 'Казань', district: 'Приволжский', age: 25, gender: 'male', has_apartment: 0, budget_min: 15000, budget_max: 20000})
addUser({username: 'nastya_ufa', full_name: 'Анастасия Белкина', city: 'Уфа', age: 22, gender: 'female', has_apartment: 0, budget_min: 17500, budget_max: 22500})
addUser({username: 'pavel_ekb', full_name: 'Павел Морозов', city: 'Екатеринбург', age: 30, gender: 'male', has_apartment: 1, apartment_description: 'Двухкомнатная, ищу соседа'})
addUser({username: 'anna_msc', full_name: 'Анна Федорова', city: 'Москва', age: 23, gender: 'female', has_apartment: 0, budget_min: 27500, budget_max: 35000})
addUser({username: 'max_kzn', full_name: 'Максим Киров', city: 'Казань', district: 'Кировский', age: 24, gender: 'male', has_apartment: 0, budget_min: 12000, budget_max: 20000})
addUser({username: 'olga_ekb', full_name: 'Ольга Лекарева', city: 'Екатеринбург', age: 28, gender: 'female', has_apartment: 1, apartment_description: 'Рядом с работой'})
addUser({username: 'artem_msc', full_name: 'Артем Поваров', city: 'Москва', age: 26, gender: 'male', has_apartment: 0, budget_min: 25000, budget_max: 30000})
addUser({username: 'vera_kzn', full_name: 'Вера Учителева', city: 'Казань', district: 'Московский', age: 27, gender: 'female', has_apartment: 1, apartment_description: 'Уютная однокомнатная квартира'})
addUser({username: 'denis_ekb', full_name: 'Денис Автомеханик', city: 'Екатеринбург', age: 25, gender: 'male', has_apartment: 0, budget_min: 15000, budget_max: 25000})
addUser({username: 'alex_kazan', full_name: 'Александр Сидоров', city: 'Казань', district: 'Вахитовский', age: 25, gender: 'male', has_apartment: 0})
addUser({username: 'dima_kazan', full_name: 'Дмитрий Кузнецов', city: 'Казань', district: 'Авиастроительный', age: 26, gender: 'male', has_apartment: 1, apartment_description: 'Однокомнатная квартира'})
addUser({username: 'sergey_kazan', full_name: 'Сергей Смирнов', city: 'Казань', district: 'Кировский', age: 24, gender: 'male', has_apartment: 0})
addUser({username: 'andrey_kazan', full_name: 'Андрей Попов', city: 'Казань', district: 'Приволжский', age: 27, gender: 'male', has_apartment: 1, apartment_description: 'Двухкомнатная квартира'})
addUser({username: 'alexey_kazan', full_name: 'Алексей Волков', city: 'Казань', district: 'Московский', age: 23, gender: 'male', has_apartment: 0})
addUser({username: 'mikhail_kazan', full_name: 'Михаил Соколов', city: 'Казань', district: 'Ново-Савиновский', age: 28, gender: 'male', has_apartment: 1, apartment_description: 'Уютная студия'})
addUser({username: 'pavel_kazan', full_name: 'Павел Лебедев', city: 'Казань', district: 'Советский', age: 22, gender: 'male', has_apartment: 0})
addUser({username: 'roman_kazan', full_name: 'Роман Козлов', city: 'Казань', district: 'Вахитовский', age: 29, gender: 'male', has_apartment: 1, apartment_description: 'Квартира в центре'})
addUser({username: 'nikolay_kazan', full_name: 'Николай Новиков', city: 'Казань', district: 'Авиастроительный', age: 26, gender: 'male', has_apartment: 0})
addUser({username: 'ivan_kazan', full_name: 'Иван Морозов', city: 'Казань', district: 'Кировский', age: 24, gender: 'male', has_apartment: 1, apartment_description: 'Комната в квартире'})
addUser({username: 'anna_kazan', full_name: 'Анна Иванова', city: 'Казань', district: 'Вахитовский', age: 25, gender: 'female', has_apartment: 0})
addUser({username: 'maria_kazan', full_name: 'Мария Петрова', city: 'Казань', district: 'Авиастроительный', age: 26, gender: 'female', has_apartment: 1, apartment_description: 'Однокомнатная квартира'})
addUser({username: 'elena_kazan', full_name: 'Елена Сидорова', city: 'Казань', district: 'Кировский', age: 24, gender: 'female', has_apartment: 0})
addUser({username: 'olga_kazan', full_name: 'Ольга Кузнецова', city: 'Казань', district: 'Приволжский', age: 27, gender: 'female', has_apartment: 1, apartment_description: 'Двухкомнатная квартира'})
addUser({username: 'tatyana_kazan', full_name: 'Татьяна Смирнова', city: 'Казань', district: 'Московский', age: 23, gender: 'female', has_apartment: 0})
addUser({username: 'natalya_kazan', full_name: 'Наталья Попова', city: 'Казань', district: 'Ново-Савиновский', age: 28, gender: 'female', has_apartment: 1, apartment_description: 'Уютная студия'})
addUser({username: 'svetlana_kazan', full_name: 'Светлана Волкова', city: 'Казань', district: 'Советский', age: 22, gender: 'female', has_apartment: 0})
addUser({username: 'irina_kazan', full_name: 'Ирина Соколова', city: 'Казань', district: 'Вахитовский', age: 29, gender: 'female', has_apartment: 1, apartment_description: 'Квартира в центре'})
addUser({username: 'ekaterina_kazan', full_name: 'Екатерина Лебедева', city: 'Казань', district: 'Авиастроительный', age: 26, gender: 'female', has_apartment: 0})
addUser({username: 'yuliya_kazan', full_name: 'Юлия Козлова', city: 'Казань', district: 'Кировский', age: 24, gender: 'female', has_apartment: 1, apartment_description: 'Комната в квартире'})
addUser({username: 'kristina_msc', full_name: 'Кристина Дизайнер', city: 'Москва', age: 24, gender: 'female', has_apartment: 0, budget_min: 22000, budget_max: 33000})
// Generate some additional mixed users to reach ~40 entries
const additionalNames = [
  { name: 'Вадим Сантехников', gender: 'male', username: 'vadim_plumb' },
  { name: 'Ирина Пилотова', gender: 'female', username: 'irina_pilot' },
  { name: 'Антон Инженеров', gender: 'male', username: 'anton_eng' },
  { name: 'Милана Стюардесс', gender: 'female', username: 'milana_stew' },
  { name: 'Роман Техников', gender: 'male', username: 'roman_tech' },
  { name: 'Юлия Банкирова', gender: 'female', username: 'julia_bank' },
  { name: 'Тимофей Кофейников', gender: 'male', username: 'tim_coffee' },
  { name: 'Полина Психологова', gender: 'female', username: 'polina_psych' },
  { name: 'Константин Фотографов', gender: 'male', username: 'kostya_photo' },
  { name: 'Александра Переводчицына', gender: 'female', username: 'sasha_trans' },
  { name: 'Артур Танцоров', gender: 'male', username: 'arthur_dance' },
  { name: 'Виктория Ветеринарова', gender: 'female', username: 'vika_vet' },
  { name: 'Егор Геймеров', gender: 'male', username: 'egor_game' },
  { name: 'Валерия Цветочкина', gender: 'female', username: 'lera_flower' },
  { name: 'Зоя Поварёшкина', gender: 'female', username: 'zoya_cook' },
  { name: 'Ян Татуировщиков', gender: 'male', username: 'yan_tattoo' },
  { name: 'Марина Риелторша', gender: 'female', username: 'marina_real' },
  { name: 'Степан Курьеров', gender: 'male', username: 'stepan_deliver' },
  { name: 'Анна Менеджерова', gender: 'female', username: 'anna_manager' },
  { name: 'Федор Кузнецов', gender: 'male', username: 'fedor_smith' },
  { name: 'Татьяна Массажистка', gender: 'female', username: 'tanya_massage' },
  { name: 'Алексей Бармен', gender: 'male', username: 'alex_bar' },
  { name: 'Людмила Экономистка', gender: 'female', username: 'lyuda_econ' },
  { name: 'Григорий Строитель', gender: 'male', username: 'grisha_build' },
  { name: 'Екатерина Блогерша', gender: 'female', username: 'katya_blog' },
  { name: 'Михаил Доставщиков', gender: 'male', username: 'misha_delivery' }
]

const cities = ['Казань','Уфа','Челябинск','Москва','Екатеринбург']
const districts = kazanDistrictsForMock

// Добавляем дополнительных пользователей
additionalNames.forEach((person, index) => {
  const tgId = nextTg++
  const city = cities[Math.floor(Math.random() * cities.length)]
  const district = city === 'Казань' ? districts[Math.floor(Math.random() * districts.length)] : ''
  const age = 22 + Math.floor(Math.random() * 12) // возраст от 22 до 33
  const hasApartment = Math.random() > 0.6 ? 1 : 0
  const gender = person.gender
  const username = person.username + '_' + (index+1)

  const budget_min = hasApartment ? 0 : randMultipleOf(500, 5000, 30000)
  const budget_max = hasApartment ? 0 : Math.max(budget_min + 500, randMultipleOf(500, budget_min + 500, 40000))

  mockUsers.push({
    tg_id: tgId,
    username: username,
    full_name: person.name,
    has_apartment: hasApartment,
    city: city,
    district: district,
    age: age,
    gender: gender,
    budget_min: budget_min,
    budget_max: budget_max,
    bio: `${hasApartment ? 'Есть квартира, ищу соседа.' : 'Ищу квартиру и соседа.'} Работаю по специальности, ответственный человек.`,
    apartment_description: hasApartment ? 'Уютная квартира с хорошим ремонтом' : null
  })
})

console.log(`Подготовлено ${mockUsers.length} пользователей для добавления в базу данных`)

// Отслеживаем использованные фотографии
const usedFemalePhotos = new Set()
const usedMalePhotos = new Set()

// Добавляем фотографии к каждому пользователю
mockUsers.forEach(user => {
  if (user.gender === 'female') {
    user.photo_url = getRandomPhotoByGender('female', usedFemalePhotos)
  } else {
    user.photo_url = getRandomPhotoByGender('male', usedMalePhotos)
  }
})

// Очищаем таблицу пользователей
db.prepare('DELETE FROM users WHERE tg_id >= 1001').run()

// Добавляем пользователей
const insertUser = db.prepare(`
  INSERT INTO users (
    tg_id, username, full_name, photo_url, has_apartment, city, district, 
    age, gender, budget_min, budget_max, bio, apartment_description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const transaction = db.transaction(() => {
  mockUsers.forEach(user => {
    insertUser.run(
      user.tg_id,
      user.username,
      user.full_name,
      user.photo_url,
      user.has_apartment,
      user.city,
      user.district,
      user.age,
      user.gender,
      user.budget_min,
      user.budget_max,
      user.bio,
      user.apartment_description
    )
  })
})

try {
  transaction()
  console.log(`Успешно добавлено ${mockUsers.length} мок пользователей с уникальными фотографиями!`)
  
  // Статистика по использованным фотографиям
  const femaleCount = mockUsers.filter(u => u.gender === 'female').length
  const maleCount = mockUsers.filter(u => u.gender === 'male').length
  
  console.log(`Женщин: ${femaleCount} (использовано ${usedFemalePhotos.size} уникальных фото из ${femalePhotos.length} доступных)`)
  console.log(`Мужчин: ${maleCount} (использовано ${usedMalePhotos.size} уникальных фото из ${malePhotos.length} доступных)`)
  
} catch (error) {
  console.error('Ошибка при добавлении пользователей:', error)
}

db.close()
