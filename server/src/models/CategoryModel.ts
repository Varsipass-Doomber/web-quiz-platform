import { BaseModel } from './base';
import { supabase } from '../config/database';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export class CategoryModel extends BaseModel {
  constructor() {
    super('categories');
  }

  // Получить все категории
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  }

  // Найти категорию по имени
  async findByName(name: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('name', name)
      .single();
    if (error) throw error;
    return data;
  }
}