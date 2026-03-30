import { supabase } from '../lib/supabase';
import { Lista } from '../types/database';
import { columnService } from './columnService';

export const listService = {
  async getLists(userId: string) {
    const { data, error } = await supabase
      .from('listas')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data as Lista[];
  },

  async getListById(id: string) {
    const { data, error } = await supabase
      .from('listas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Lista | null;
  },

  async getListByUser(userId: string) {
    const { data, error } = await supabase
      .from('listas')
      .select('*')
      .eq('usuario_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as Lista | null;
  },

  async createList(titulo: string, usuarioId: string, descricao: string | null = null) {
    const { data, error } = await supabase
      .from('listas')
      .insert([{ titulo, descricao, usuario_id: usuarioId }])
      .select()
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      await columnService.createDefaultColumns(data.id);
    }
    
    return data as Lista;
  },

  async updateList(id: string, updates: Partial<Pick<Lista, 'titulo' | 'descricao'>>) {
    const { data, error } = await supabase
      .from('listas')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Lista;
  },

  async deleteList(id: string) {
    const { error } = await supabase
      .from('listas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
