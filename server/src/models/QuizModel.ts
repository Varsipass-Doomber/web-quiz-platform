import { BaseModel } from './base';
import { QuestionModel } from './QuestionModel';
import { supabase } from '../config/database';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;            
  category_id?: string;        
  image_url?: string;           
  time_limit: number;
  organizer_id: string;
  room_code: string;
  is_active: boolean;
  is_public: boolean;     
  max_participants: number;    
  status: 'draft' | 'active' | 'finished';
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export class QuizModel extends BaseModel {
  constructor() {
    super('quizzes');
  }

  private generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = ''; // Инициализируем сразу
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  
  // Генерация уникального кода комнаты
  async generateRoomCode(): Promise<string> {
    let code: string;
    let exists: boolean; // Явно указываем тип

    do {
      code = this.generateRandomCode();
      const { data } = await supabase
        .from('quizzes')
        .select('id')
        .eq('room_code', code);

      // Проверяем, существует ли уже такой код
      exists = data !== null && data.length > 0;
    } while (exists);

    return code;
  }

  // Создать квиз с автоматической генерацией кода
  async createQuiz(data: Omit<Quiz, 'id' | 'room_code' | 'created_at' | 'is_active' | 'status'>) {
  const roomCode = await this.generateRoomCode();
  return this.create({
    ...data, // теперь data содержит is_public, max_participants, category_id, image_url
    room_code: roomCode,
    is_active: false,
    status: 'draft'
  });
}

  // Найти квиз по коду комнаты
  async findByRoomCode(roomCode: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('room_code', roomCode)
      .single();
    if (error) throw error;
    return data;
  }

  // Получить квиз с вопросами
  async getQuizWithQuestions(quizId: string) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*, categories(name)') // <-- Добавлено
      .eq('id', quizId)
      .single();
    if (quizError) throw quizError;

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_number', { ascending: true });
    if (questionsError) throw questionsError;

    return { ...quiz, questions };
  }

  // Новый метод в QuizModel
  async getQuizzesByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, categories(name)')
      .eq('category_id', categoryId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Запустить квиз
  async startQuiz(quizId: string) {
    const now = new Date().toISOString();
    return this.update(quizId, {
      is_active: true,
      status: 'active',
      started_at: now
    });
  }

  // Завершить квиз
  async finishQuiz(quizId: string) {
    const now = new Date().toISOString();
    return this.update(quizId, {
      is_active: false,
      status: 'finished',
      finished_at: now
    });
  }

  // Получить активные квизы
  async getActiveQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, users(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Получить популярные категории
  async getPopularCategories() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('category')
      .not('category', 'is', null);
    if (error) throw error;

    const counts: Record<string, number> = {};
    data.forEach((q: any) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Получить топ-5 лучших квизов (по количеству участников)
  async getTopQuizzes(limit: number = 5) {
    const { data, error } = await supabase
      .from('results')
      .select('quiz_id, count')
      .limit(limit);
    if (error) throw error;
    return data;
  }

  // Проверить, есть ли активный квиз с таким кодом
  async isRoomAvailable(roomCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id')
      .eq('room_code', roomCode)
      .eq('status', 'active')
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Код не найден
      return true;
    }
    if (error) throw error;
    
    // Если данные есть, то комната занята
    return data === null;
  }
}