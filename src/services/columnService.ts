import { supabase } from '../lib/supabase';
import { Coluna } from '../types/database';

export const columnService = {
  async getColumnsByList(listaId: string) {
    const { data, error } = await supabase
      .from('colunas')
      .select('*')
      .eq('lista_id', listaId)
      .order('ordem', { ascending: true });

    if (error) throw error;
    return data as Coluna[];
  },

  async getNextOrdem(listaId: string) {
    const { data, error } = await supabase
      .from('colunas')
      .select('ordem')
      .eq('lista_id', listaId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data && data.ordem ? data.ordem + 1 : 1;
  },

  async createColumn(columnData: Omit<Coluna, 'id' | 'criado_em' | 'atualizado_em'>) {
    const columnDataWithTipo = { ...columnData, tipo: columnData.tipo || 'padrao' };
    const { data, error } = await supabase
      .from('colunas')
      .insert([columnDataWithTipo])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Coluna;
  },

  async createDefaultColumns(listaId: string) {
    const defaultColumns = [
      { titulo: 'A fazer', ordem: 1, lista_id: listaId, tipo: 'padrao' },
      { titulo: 'Em andamento', ordem: 2, lista_id: listaId, tipo: 'padrao' },
      { titulo: 'Concluído', ordem: 3, lista_id: listaId, tipo: 'concluido' },
    ];

    const { data, error } = await supabase
      .from('colunas')
      .insert(defaultColumns)
      .select();

    if (error) throw error;
    return data as Coluna[];
  },

  async updateColumn(id: string, updates: Partial<Pick<Coluna, 'titulo' | 'ordem' | 'tipo'>>) {
    const { data, error } = await supabase
      .from('colunas')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Coluna;
  },

  async deleteColumn(id: string) {
    const { error } = await supabase
      .from('colunas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
