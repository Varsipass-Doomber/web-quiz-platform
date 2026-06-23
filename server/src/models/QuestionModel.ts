import { BaseModel } from './base';
import { supabase } from '../config/database';

export interface Question {
  id: string;
  quiz_id: string;
  type: 'text' | 'image' | 'single' | 'multiple';
  content: string;
  image_url?: string;          
  options?: any;
  correct_answer: any;
  points: number;
  order_number: number;
  time_limit?: number;
  hint?: string;             
  explanation?: string;        
  created_at: string;
}

export class QuestionModel extends BaseModel {
  constructor() {
    super('questions');
  }

  // Получить все вопросы для квиза
  async getQuestionsByQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_number', { ascending: true });
    if (error) throw error;
    return data;
  }

  // Создать несколько вопросов сразу
  async createMany(questions: Omit<Question, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();
    if (error) throw error;
    return data;
  }

  // Обновить порядок вопросов (после удаления/вставки)
  async reorderQuestions(quizId: string) {
    const questions = await this.getQuestionsByQuiz(quizId);
    const updates = questions.map((q, index) => ({
      id: q.id,
      order_number: index + 1
    }));

    for (const update of updates) {
      await this.update(update.id, { order_number: update.order_number });
    }
    return true;
  }

  // Удалить все вопросы для квиза
  async deleteByQuiz(quizId: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', quizId);
    if (error) throw error;
    return true;
  }

  // Проверить ответ пользователя
  checkAnswer(question: Question, userAnswer: any): boolean {
    if (question.type === 'single') {
      return userAnswer === question.correct_answer;
    } else if (question.type === 'multiple') {
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correct_answer)) {
        return false;
      }
      const sortedUser = [...userAnswer].sort();
      const sortedCorrect = [...question.correct_answer].sort();
      return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
    }
    return false;
  }
}