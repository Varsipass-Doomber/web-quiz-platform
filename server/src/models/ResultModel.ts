import { BaseModel } from './base';
import { QuestionModel } from './QuestionModel';
import { supabase } from '../config/database';

export interface Result {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;     // <-- Добавлено
  answers: Record<string, any>;
  time_spent?: number;
  completed_at: string;
}

export class ResultModel extends BaseModel {
  constructor() {
    super('results');
  }

  // Сохранить результат после завершения квиза
  async saveResult(quizId: string, userId: string) {
    const { data: session, error: sessionError } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .single();
    if (sessionError) throw sessionError;

    if (!session) {
      throw new Error('No active session found');
    }

    const questionModel = new QuestionModel();
    const questions = await questionModel.getQuestionsByQuiz(quizId);
    const totalQuestions = questions.length; // <-- Добавлено

    let correct = 0;
    let wrong = 0;

    questions.forEach((q: any) => {
      const userAnswer = session.answers[q.id];
      if (userAnswer !== undefined) {
        const isCorrect = questionModel.checkAnswer(q, userAnswer);
        if (isCorrect) correct++;
        else wrong++;
      }
    });

    const result = await this.create({
      quiz_id: quizId,
      user_id: userId,
      score: session.current_score,
      correct_answers: correct,
      wrong_answers: wrong,
      total_questions: totalQuestions, // <-- Добавлено
      answers: session.answers,
      time_spent: Math.floor((Date.now() - new Date(session.joined_at).getTime()) / 1000)
    });

    await supabase
      .from('active_sessions')
      .delete()
      .eq('id', session.id);

    return result;
  }

  // Получить результаты по квизу (лидерборд)
  async getLeaderboard(quizId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('*, users(full_name, avatar_url)')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Получить результат пользователя для конкретного квиза
  async getUserResult(quizId: string, userId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  }

  // Получить историю пользователя
  async getUserHistory(userId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('*, quizzes(title, category, organizer_id)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Получить общую статистику по квизу
  async getQuizStats(quizId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('score, correct_answers, wrong_answers')
      .eq('quiz_id', quizId);
    if (error) throw error;

    const totalParticipants = data.length;
    const averageScore = totalParticipants > 0
      ? Math.round(data.reduce((sum: number, r: any) => sum + r.score, 0) / totalParticipants)
      : 0;

    return {
      totalParticipants,
      averageScore,
      maxScore: totalParticipants > 0 ? Math.max(...data.map((r: any) => r.score)) : 0,
      totalCorrect: data.reduce((sum: number, r: any) => sum + r.correct_answers, 0),
      totalWrong: data.reduce((sum: number, r: any) => sum + r.wrong_answers, 0)
    };
  }
}