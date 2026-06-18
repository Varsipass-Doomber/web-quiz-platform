import { supabase } from '../config/database';

export class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Получить все записи
  async findAll(filters?: Record<string, any>) {
    let query = supabase.from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Найти по ID
  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // Создать запись
  async create(data: Record<string, any>) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Обновить запись
  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Удалить запись
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}