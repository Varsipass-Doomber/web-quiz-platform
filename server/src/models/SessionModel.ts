import { BaseModel } from './base';
import { supabase } from '../config/database';

export interface ActiveSession {
  id: string;
  quiz_id: string;
  user_id: string;
  joined_at: string;
  last_active: string;
  current_score: number;
  answers: Record<string, any>;
}

export class SessionModel extends BaseModel {
  constructor() {
    super('active_sessions');
  }

  // Добавить участника в комнату
  async joinQuiz(quizId: string, userId: string) {
    return this.create({
      quiz_id: quizId,
      user_id: userId,
      current_score: 0,
      answers: {}
    });
  }

  // Выйти из комнаты
  async leaveQuiz(quizId: string, userId: string) {
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('quiz_id', quizId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  // Получить всех участников квиза
  async getParticipants(quizId: string) {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('*, users(full_name, avatar_url)')
      .eq('quiz_id', quizId)
      .order('current_score', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Обновить ответ и счет участника
  async updateAnswer(quizId: string, userId: string, questionId: string, answer: any, score: number) {
    const session = await this.findByUserAndQuiz(quizId, userId);
    if (!session) throw new Error('Session not found');

    const answers = { ...session.answers, [questionId]: answer };
    const currentScore = session.current_score + score;

    return this.update(session.id, {
      answers,
      current_score: currentScore,
      last_active: new Date().toISOString()
    });
  }

  // Найти сессию по пользователю и квизу
  async findByUserAndQuiz(quizId: string, userId: string) {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  }

  // Проверить, находится ли пользователь в комнате
  async isUserInRoom(quizId: string, userId: string): Promise<boolean> {
    const session = await this.findByUserAndQuiz(quizId, userId);
    return session !== null;
  }

  // Очистить все сессии для квиза (при завершении)
  async clearByQuiz(quizId: string) {
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('quiz_id', quizId);
    if (error) throw error;
    return true;
  }
}