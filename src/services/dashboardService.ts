import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardData(userId: string, listaId?: string) {
    let query = supabase
      .from('tarefas')
      .select('*, colunas!inner(id, titulo, tipo, ordem), listas!inner(id, titulo)')
      .eq('listas.usuario_id', userId);

    if (listaId) {
      query = query.eq('lista_id', listaId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
};
