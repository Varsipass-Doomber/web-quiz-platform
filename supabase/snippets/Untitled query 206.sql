-- Проверка, что таблица существует и доступна
-- Даем права на все таблицы в схеме public для сервисного ключа
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Даем права на все последовательности (для автоинкремента)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Даем права на все функции (для триггеров)
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Или только на таблицу users (если не хотите давать права на все)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;