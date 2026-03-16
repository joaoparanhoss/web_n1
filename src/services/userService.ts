import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database';

export const userService = {
  /**
   * Busca todos os usuários
   */
  async getUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');
    if (error) throw error;
    return data as Usuario[];
  },

  /**
   * Busca um usuário pelo ID
   */
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Usuario | null;
  },

  /**
   * Cria um novo usuário
   */
  async createUser(userData: Omit<Usuario, 'id' | 'criado_em'>) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, userData: Partial<Usuario>) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Deleta um usuário
   */
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
