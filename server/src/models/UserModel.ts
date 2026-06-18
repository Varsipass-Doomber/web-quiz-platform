import { BaseModel } from './base';
import { supabase } from '../config/database';

export interface User {
  id: string;
  full_name: string;
  role: 'organizer' | 'participant';
  avatar_url?: string;
  created_at: string;
}

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  // Найти пользователя по email (использует auth.users)
  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    return data;
  }

  // Получить профиль пользователя с данными из auth
  async getProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return user;
  }

  // Обновить профиль
  async updateProfile(userId: string, data: Partial<User>) {
    return this.update(userId, data);
  }

  // Получить все квизы, созданные пользователем
  async getOrganizedQuizzes(userId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Получить все квизы, в которых участвовал пользователь
  async getParticipatedQuizzes(userId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('quizzes(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map((r: any) => r.quizzes);
  }

  // Получить статистику пользователя
  async getStats(userId: string) {
    const { data: results, error } = await supabase
      .from('results')
      .select('score, correct_answers, wrong_answers')
      .eq('user_id', userId);
    if (error) throw error;

    const totalQuizzes = results.length;
    const totalScore = results.reduce((sum: number, r: any) => sum + r.score, 0);
    const totalCorrect = results.reduce((sum: number, r: any) => sum + r.correct_answers, 0);
    const totalWrong = results.reduce((sum: number, r: any) => sum + r.wrong_answers, 0);

    return {
      totalQuizzes,
      totalScore,
      totalCorrect,
      totalWrong,
      averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0
    };
  }
}