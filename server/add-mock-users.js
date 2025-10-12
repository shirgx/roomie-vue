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

const mockUsers = [
  {
    tg_id: 1001,
    username: 'anna_kazan',
    full_name: 'Анна Петрова',
    photo_url: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Вахитовский',
    age: 23,
    gender: 'female',
    budget_min: 15000,
    budget_max: 25000,
    bio: 'Студентка КФУ, изучаю психологию. Ищу соседку для совместной аренды в центре города. Люблю читать, готовить и смотреть фильмы.',
    apartment_description: null
  },
  {
    tg_id: 1002,
    username: 'dmitriy_tech',
    full_name: 'Дмитрий Соколов',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Ново-Савиновский',
    age: 28,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'IT-разработчик, есть двухкомнатная квартира в новостройке. Ищу соседа, который разделит коммунальные расходы. Работаю удаленно, не курю.',
    apartment_description: '2-комнатная квартира, 55 м², новостройка. Есть вся необходимая мебель и техника. Быстрый интернет, тихий район.'
  },
  {
    tg_id: 1003,
    username: 'maria_student',
    full_name: 'Мария Иванова',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Советский',
    age: 21,
    gender: 'female',
    budget_min: 12000,
    budget_max: 20000,
    bio: 'Студентка медицинского университета. Серьезно отношусь к учебе, но люблю веселиться в свободное время. Ищу девушку для совместного проживания.',
    apartment_description: null
  },
  {
    tg_id: 1004,
    username: 'alex_moscow',
    full_name: 'Александр Волков',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Москва',
    district: '',
    age: 26,
    gender: 'male',
    budget_min: 30000,
    budget_max: 50000,
    bio: 'Маркетолог, переехал в Москву по работе. Ищу квартиру и соседа в районе метро. Занимаюсь спортом, не конфликтный, за порядок.',
    apartment_description: null
  },
  {
    tg_id: 1005,
    username: 'elena_design',
    full_name: 'Елена Смирнова',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Санкт-Петербург',
    district: '',
    age: 25,
    gender: 'female',
    budget_min: 0,
    budget_max: 0,
    bio: 'Графический дизайнер, фрилансер. Есть уютная квартира в историческом центре. Ищу творческого соседа, который ценит искусство и атмосферу города.',
    apartment_description: '1-комнатная студия, 40 м², исторический центр. Высокие потолки, большие окна, отличный ремонт. Рядом Невский проспект.'
  },
  {
    tg_id: 1006,
    username: 'ivan_student',
    full_name: 'Иван Морозов',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Авиастроительный',
    age: 22,
    gender: 'male',
    budget_min: 10000,
    budget_max: 18000,
    bio: 'Студент технического университета, изучаю авиастроение. Тихий, учусь на отлично. Ищу такого же серьезного соседа для совместной аренды.',
    apartment_description: null
  },
  {
    tg_id: 1007,
    username: 'oksana_teacher',
    full_name: 'Оксана Белова',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Екатеринбург',
    district: '',
    age: 29,
    gender: 'female',
    budget_min: 0,
    budget_max: 0,
    bio: 'Учитель английского языка, есть просторная квартира рядом со школой. Ищу ответственную соседку, желательно тоже из сферы образования.',
    apartment_description: '3-комнатная квартира, 70 м², кирпичный дом. Две свободные комнаты, отдельная кухня-гостиная. Рядом парк и остановка.'
  },
  {
    tg_id: 1008,
    username: 'ruslan_kazan',
    full_name: 'Руслан Гайнуллин',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Вахитовский',
    age: 27,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Предприниматель, владелец кофейни. Есть квартира в центре с панорамным видом. Ищу соседа, который разделит расходы.',
    apartment_description: '2-комнатная квартира, 65 м², 15 этаж. Панорамный вид на Кремль, современный ремонт, вся техника. Рядом Кремлевская набережная.'
  },
  {
    tg_id: 1009,
    username: 'alina_kzn',
    full_name: 'Алина Сафина',
    photo_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Приволжский',
    age: 24,
    gender: 'female',
    budget_min: 13000,
    budget_max: 22000,
    bio: 'Работаю в IT-компании аналитиком. Ищу квартиру и соседку недалеко от IT-park. Спокойная, чистоплотная.',
    apartment_description: null
  },
  {
    tg_id: 1010,
    username: 'timur_kzn',
    full_name: 'Тимур Хасанов',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Московский',
    age: 30,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Инженер на заводе. Есть трёшка в Московском районе. Одна комната свободна. Тихий, не пью, не курю.',
    apartment_description: '3-комнатная квартира, 75 м², кирпичный дом. Свежий ремонт, отдельная кухня, балкон. До метро 5 минут.'
  },
  {
    tg_id: 1011,
    username: 'kamila_kzn',
    full_name: 'Камила Валеева',
    photo_url: 'https://images.unsplash.com/photo-1532073150508-0c1df022bdd1?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Вахитовский',
    age: 22,
    gender: 'female',
    budget_min: 16000,
    budget_max: 28000,
    bio: 'Студентка, изучаю журналистику. Активная, общительная. Ищу соседку для совместной аренды в центре.',
    apartment_description: null
  },
  {
    tg_id: 1012,
    username: 'artem_kazan',
    full_name: 'Артём Николаев',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Ново-Савиновский',
    age: 26,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Программист, работаю удаленно. Есть двушка в новостройке. Ищу тихого соседа, который не будет мешать работе.',
    apartment_description: '2-комнатная квартира, 58 м², 10 этаж новостройки. Отличный ремонт, мебель, техника. Оптоволокно 500 Мбит/с.'
  },
  {
    tg_id: 1013,
    username: 'diana_kazan',
    full_name: 'Диана Мингалеева',
    photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Советский',
    age: 25,
    gender: 'female',
    budget_min: 14000,
    budget_max: 23000,
    bio: 'Врач-стоматолог. Ищу соседку, желательно тоже из медицинской сферы. Аккуратная, ответственная.',
    apartment_description: null
  },
  {
    tg_id: 1014,
    username: 'denis_kzn',
    full_name: 'Денис Яковлев',
    photo_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Кировский',
    age: 29,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Менеджер по продажам. Есть двушка в Кировском районе. Одна комната свободна. Дружелюбный, за чистоту.',
    apartment_description: '2-комнатная квартира, 52 м², 5/9 панельный дом. Хороший ремонт, вся мебель. Рядом парк Победы и торговый центр.'
  },
  {
    tg_id: 1015,
    username: 'regina_kazan',
    full_name: 'Регина Ахметова',
    photo_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Приволжский',
    age: 23,
    gender: 'female',
    budget_min: 12000,
    budget_max: 20000,
    bio: 'Учусь в Институте Управления. Тихая, не конфликтная. Ищу соседку для аренды квартиры.',
    apartment_description: null
  },
  {
    tg_id: 1016,
    username: 'ildar_kazan',
    full_name: 'Ильдар Галиев',
    photo_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Вахитовский',
    age: 31,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Архитектор. Есть просторная трёшка в историческом центре. Две комнаты свободны. Люблю порядок и тишину.',
    apartment_description: '3-комнатная квартира, 82 м², исторический центр. Высокие потолки, лепнина, паркет. Вид на Кремль. Дизайнерский ремонт.'
  },
  {
    tg_id: 1017,
    username: 'julia_kzn',
    full_name: 'Юлия Романова',
    photo_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Московский',
    age: 26,
    gender: 'female',
    budget_min: 15000,
    budget_max: 25000,
    bio: 'Маркетолог в крупной компании. Ищу соседку для совместной аренды. Люблю готовить и принимать гостей.',
    apartment_description: null
  },
  {
    tg_id: 1018,
    username: 'marat_kazan',
    full_name: 'Марат Нуриев',
    photo_url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Ново-Савиновский',
    age: 28,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Финансовый аналитик. Есть двушка недалеко от Riviera. Ищу соседа, который поможет с коммуналкой.',
    apartment_description: '2-комнатная квартира, 60 м², ЖК "Светлый". Современная планировка, мебель, техника. До ТРЦ Riviera 10 минут пешком.'
  },
  {
    tg_id: 1019,
    username: 'leysan_kazan',
    full_name: 'Лейсан Шакирова',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Советский',
    age: 24,
    gender: 'female',
    budget_min: 13000,
    budget_max: 21000,
    bio: 'Дизайнер интерьеров. Творческая личность. Ищу соседку с похожими интересами для совместной аренды.',
    apartment_description: null
  },
  {
    tg_id: 1020,
    username: 'rinat_kzn',
    full_name: 'Ринат Закиров',
    photo_url: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Авиастроительный',
    age: 27,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Инженер на авиазаводе. Есть однушка рядом с работой. Ищу соседа для разделения расходов. Спокойный, за ЗОЖ.',
    apartment_description: '1-комнатная квартира, 38 м², новый дом. Свежий ремонт, встроенная кухня. Рядом КАИ и авиазавод.'
  },
  {
    tg_id: 1021,
    username: 'svetlana_kazan',
    full_name: 'Светлана Козлова',
    photo_url: 'https://images.unsplash.com/photo-1598897516650-e4dc73d8e417?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Кировский',
    age: 22,
    gender: 'female',
    budget_min: 11000,
    budget_max: 19000,
    bio: 'Студентка педагогического университета. Тихая, спокойная. Ищу соседку для совместной аренды недорогой квартиры.',
    apartment_description: null
  },
  {
    tg_id: 1022,
    username: 'aidar_kazan',
    full_name: 'Айдар Файзуллин',
    photo_url: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Приволжский',
    age: 30,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Бизнес-тренер. Есть трёшка с хорошим ремонтом. Одна комната свободна. Ищу ответственного соседа.',
    apartment_description: '3-комнатная квартира, 78 м², монолит. Качественный ремонт, большая кухня-студия, два санузла. Закрытый двор с парковкой.'
  },
  {
    tg_id: 1023,
    username: 'alsu_kazan',
    full_name: 'Алсу Гараева',
    photo_url: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Вахитовский',
    age: 25,
    gender: 'female',
    budget_min: 17000,
    budget_max: 29000,
    bio: 'Юрист в крупной компании. Ищу соседку для аренды квартиры в центре. Аккуратная, без вредных привычек.',
    apartment_description: null
  },
  {
    tg_id: 1024,
    username: 'vadim_kazan',
    full_name: 'Вадим Петров',
    photo_url: 'https://images.unsplash.com/photo-1544168190-79c17527004f?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Московский',
    age: 29,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Врач-хирург. Есть двушка недалеко от больницы. Ищу соседа, желательно тоже из медицины. За чистоту и порядок.',
    apartment_description: '2-комнатная квартира, 54 м², 8/16 кирпичный дом. Хороший ремонт, вся мебель и техника. Рядом РКБ и метро.'
  },
  {
    tg_id: 1025,
    username: 'zarina_kzn',
    full_name: 'Зарина Хамитова',
    photo_url: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Ново-Савиновский',
    age: 23,
    gender: 'female',
    budget_min: 14000,
    budget_max: 22000,
    bio: 'Фотограф-фрилансер. Творческая, открытая к общению. Ищу соседку для совместной аренды.',
    apartment_description: null
  },
  {
    tg_id: 1026,
    username: 'anton_kazan',
    full_name: 'Антон Смирнов',
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Казань',
    district: 'Советский',
    age: 32,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Преподаватель университета. Есть трёшка рядом с КФУ. Две комнаты свободны. Ищу тихих соседей, желательно студентов.',
    apartment_description: '3-комнатная квартира, 72 м², сталинка. Высокие потолки, большая кухня, балкон. До КФУ 10 минут пешком.'
  },
  {
    tg_id: 1027,
    username: 'gulshat_kazan',
    full_name: 'Гульшат Камалова',
    photo_url: 'https://images.unsplash.com/photo-1552699611-e2c208d5d9cf?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Казань',
    district: 'Приволжский',
    age: 26,
    gender: 'female',
    budget_min: 15000,
    budget_max: 24000,
    bio: 'HR-менеджер. Ищу соседку для аренды квартиры. Люблю йогу, здоровый образ жизни. Чистоплотная.',
    apartment_description: null
  },
  {
    tg_id: 1028,
    username: 'sergey_msk',
    full_name: 'Сергей Лебедев',
    photo_url: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Москва',
    district: '',
    age: 28,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Менеджер IT-проекта. Есть двушка в районе метро Тульская. Ищу соседа для разделения расходов. Спокойный, работаю много.',
    apartment_description: '2-комнатная квартира, 50 м², 12/17 панельный дом. Евроремонт, мебель, техника. До метро Тульская 5 минут.'
  },
  {
    tg_id: 1029,
    username: 'natasha_msk',
    full_name: 'Наташа Соловьёва',
    photo_url: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Москва',
    district: '',
    age: 25,
    gender: 'female',
    budget_min: 25000,
    budget_max: 40000,
    bio: 'Копирайтер в рекламном агентстве. Ищу соседку для совместной аренды в центре Москвы. Общительная, люблю котиков.',
    apartment_description: null
  },
  {
    tg_id: 1030,
    username: 'pavel_ekb',
    full_name: 'Павел Кузнецов',
    photo_url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Екатеринбург',
    district: '',
    age: 27,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Инженер-программист. Есть однушка в центре Екатеринбурга. Ищу соседа для совместного проживания. Не курю, спокойный.',
    apartment_description: '1-комнатная квартира-студия, 42 м², новостройка. Современный ремонт, вся техника. Центр города, рядом Плотинка.'
  },
  {
    tg_id: 1031,
    username: 'olga_ekb',
    full_name: 'Ольга Васильева',
    photo_url: 'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Екатеринбург',
    district: '',
    age: 24,
    gender: 'female',
    budget_min: 12000,
    budget_max: 20000,
    bio: 'Студентка УрФУ, изучаю экономику. Ищу соседку для совместной аренды. Аккуратная, не шумная.',
    apartment_description: null
  },
  {
    tg_id: 1032,
    username: 'igor_chel',
    full_name: 'Игорь Морозов',
    photo_url: 'https://images.unsplash.com/photo-1624395213043-fa2e123b2656?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Челябинск',
    district: '',
    age: 30,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Инженер на металлургическом заводе. Есть двушка в спальном районе. Ищу соседа, за ЗОЖ.',
    apartment_description: '2-комнатная квартира, 52 м², 5/9 панельный дом. Обычный ремонт, есть вся мебель. Тихий район, рядом парк.'
  },
  {
    tg_id: 1033,
    username: 'anna_chel',
    full_name: 'Анна Федорова',
    photo_url: 'https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Челябинск',
    district: '',
    age: 23,
    gender: 'female',
    budget_min: 10000,
    budget_max: 17000,
    bio: 'Менеджер по продажам. Ищу соседку для аренды недорогой квартиры. Общительная, люблю готовить.',
    apartment_description: null
  },
  {
    tg_id: 1034,
    username: 'dima_ufa',
    full_name: 'Дмитрий Сидоров',
    photo_url: 'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Уфа',
    district: '',
    age: 29,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Нефтяник. Есть двушка в новом районе. Ищу соседа для разделения коммунальных расходов. Тихий, не конфликтный.',
    apartment_description: '2-комнатная квартира, 56 м², новостройка. Хороший ремонт, встроенная кухня, лоджия. Рядом торговый центр.'
  },
  {
    tg_id: 1035,
    username: 'lena_ufa',
    full_name: 'Лена Иванова',
    photo_url: 'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Уфа',
    district: '',
    age: 22,
    gender: 'female',
    budget_min: 11000,
    budget_max: 18000,
    bio: 'Студентка медицинского университета. Серьезная, ответственная. Ищу соседку для совместной аренды.',
    apartment_description: null
  },
  {
    tg_id: 1036,
    username: 'maxim_msk',
    full_name: 'Максим Новиков',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    has_apartment: 1,
    city: 'Москва',
    district: '',
    age: 31,
    gender: 'male',
    budget_min: 0,
    budget_max: 0,
    bio: 'Финансовый консультант. Есть трёшка в районе Сокольники. Две комнаты свободны. Ищу соседей без вредных привычек.',
    apartment_description: '3-комнатная квартира, 85 м², сталинка. Высокие потолки, большая кухня, паркет. Рядом парк Сокольники и метро.'
  },
  {
    tg_id: 1037,
    username: 'karina_ekb',
    full_name: 'Карина Белова',
    photo_url: 'https://images.unsplash.com/photo-1505968409348-bd000797c92e?w=400&h=400&fit=crop&crop=face',
    has_apartment: 0,
    city: 'Екатеринбург',
    district: '',
    age: 26,
    gender: 'female',
    budget_min: 13000,
    budget_max: 22000,
    bio: 'Маркетолог. Ищу соседку для аренды квартиры в хорошем районе. Чистоплотная, люблю порядок и уют.',
    apartment_description: null
  }
]

function addMockUsers() {
  console.log('Добавляем мок пользователей...')

  const mockIdRange = 'tg_id >= 1001 AND tg_id <= 1037'
  db.prepare(`DELETE FROM test_answers WHERE user_id IN (SELECT id FROM users WHERE ${mockIdRange})`).run()
  db.prepare(`DELETE FROM likes WHERE from_user_id IN (SELECT id FROM users WHERE ${mockIdRange}) OR to_user_id IN (SELECT id FROM users WHERE ${mockIdRange})`).run()
  const deleteMockUsers = db.prepare(`DELETE FROM users WHERE ${mockIdRange}`)
  const deletedCount = deleteMockUsers.run().changes
  console.log(`Удалено ${deletedCount} существующих мок пользователей`)

  const insertUser = db.prepare(`
    INSERT INTO users (
      tg_id, username, full_name, photo_url, has_apartment, 
      city, district, age, gender, budget_min, budget_max, bio, apartment_description
    ) VALUES (
      @tg_id, @username, @full_name, @photo_url, @has_apartment,
      @city, @district, @age, @gender, @budget_min, @budget_max, @bio, @apartment_description
    )
  `)
  
  let addedCount = 0
  for (const user of mockUsers) {
    try {
      insertUser.run(user)
      addedCount++
      console.log(`Добавлен пользователь: ${user.full_name} (@${user.username})`)
    } catch (error) {
      console.error(`Ошибка при добавлении пользователя ${user.full_name}:`, error.message)
    }
  }
  
  console.log(`\nУспешно добавлено ${addedCount} из ${mockUsers.length} мок пользователей`)

  const cityStats = db.prepare('SELECT city, COUNT(*) as count FROM users WHERE tg_id >= 1001 AND tg_id <= 1037 GROUP BY city').all()
  console.log('\nСтатистика по городам:')
  cityStats.forEach(stat => {
    console.log(`  ${stat.city}: ${stat.count} пользователей`)
  })
  
  const apartmentStats = db.prepare('SELECT COUNT(*) as count FROM users WHERE tg_id >= 1001 AND tg_id <= 1037 AND has_apartment = 1').get()
  console.log(`\nПользователей с квартирой: ${apartmentStats.count}`)
  console.log(`Пользователей без квартиры: ${mockUsers.length - apartmentStats.count}`)
}

try {
  addMockUsers()
} catch (error) {
  console.error('Ошибка при выполнении скрипта:', error)
} finally {
  db.close()
}
