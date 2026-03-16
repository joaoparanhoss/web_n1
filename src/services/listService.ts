import { supabase } from '../lib/supabase';
import { Lista } from '../types/database';

export const listService = {
  /**
   * Busca a primeira lista associada ao usuário logado, por enquanto, depois vai buscar todas
   */
  async getListByUser(userId: string) {
    const { data, error } = await supabase
      .from('listas')
      .select('*')
      .eq('usuario_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as Lista | null;
  }
};
