-- ============================================
-- МАСТЕР-СКРИПТ: Полная структура базы данных
-- ============================================

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'participant')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. ТАБЛИЦА КВИЗОВ
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  category_id UUID,
  image_url TEXT,
  time_limit INTEGER DEFAULT 30,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  max_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- 3. ТАБЛИЦА ВОПРОСОВ
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'single', 'multiple')),
  content TEXT NOT NULL,
  image_url TEXT,
  options JSONB,
  correct_answer JSONB NOT NULL,
  points INTEGER DEFAULT 1,
  order_number INTEGER NOT NULL,
  time_limit INTEGER,
  hint TEXT,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 4. ТАБЛИЦА АКТИВНЫХ СЕССИЙ
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_score INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  UNIQUE(quiz_id, user_id)
);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- 5. ТАБЛИЦА РЕЗУЛЬТАТОВ
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  time_spent INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, user_id)
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 6. ТАБЛИЦА КАТЕГОРИЙ
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 7. ТАБЛИЦА УВЕДОМЛЕНИЙ
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invite', 'result', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quizzes_organizer_id ON quizzes(organizer_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_room_code ON quizzes(room_code);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_category_id ON quizzes(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_quiz_id ON active_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_connection_id ON active_sessions(connection_id);
CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);

-- ============================================
-- БАЗОВЫЕ КАТЕГОРИИ
-- ============================================
INSERT INTO categories (name, description, icon, color) VALUES
  ('Общие знания', 'Вопросы на эрудицию', '🧠', '#4A90D9'),
  ('Наука', 'Физика, химия, биология и другие науки', '🔬', '#2ECC71'),
  ('История', 'Исторические факты и события', '📜', '#E67E22'),
  ('География', 'Страны, города, природные объекты', '🌍', '#1ABC9C'),
  ('Искусство', 'Музыка, живопись, литература', '🎨', '#9B59B6'),
  ('Спорт', 'Футбол, баскетбол, олимпийские игры', '⚽', '#E74C3C'),
  ('Кино и ТВ', 'Фильмы, сериалы, актёры', '🎬', '#F39C12'),
  ('Музыка', 'Исполнители, песни, жанры', '🎵', '#3498DB'),
  ('Еда', 'Кулинария, блюда, ингредиенты', '🍕', '#E67E22'),
  ('Технологии', 'IT, гаджеты, интернет', '💻', '#2C3E50')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)
-- ============================================

-- Политики для users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Политики для quizzes
CREATE POLICY "Anyone can view quizzes" ON quizzes
  FOR SELECT USING (true);
CREATE POLICY "Organizers can insert quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own quizzes" ON quizzes
  FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own quizzes" ON quizzes
  FOR DELETE USING (auth.uid() = organizer_id);

-- Политики для questions
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);
CREATE POLICY "Organizers can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.organizer_id = auth.uid()
    )
  );

-- Политики для active_sessions
CREATE POLICY "Users can view their own sessions" ON active_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join sessions" ON active_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON active_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Политики для results
CREATE POLICY "Users can view their own results" ON results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert results" ON results
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ДАЁМ ПРАВА СЕРВИСНОМУ КЛЮЧУ
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;