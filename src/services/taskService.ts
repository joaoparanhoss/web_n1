import { supabase } from '../lib/supabase';
import { Tarefa } from '../types/database';

export const taskService = {
  /**
   * Busca todas as tarefas de uma lista específica
   */
  async getTasksByList(listaId: string) {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('lista_id', listaId)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data as Tarefa[];
  },

  /**
   * Cria uma nova tarefa
   */
  async createTask(taskData: Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em'>) {
    if (!taskData.coluna_id) {
      const { data: defaultCol } = await supabase
        .from('colunas')
        .select('id')
        .eq('lista_id', taskData.lista_id)
        .order('ordem', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (defaultCol) {
        taskData.coluna_id = defaultCol.id;
      }
    }

    const { data, error } = await supabase
      .from('tarefas')
      .insert([taskData])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Tarefa;
  },

  /**
   * Atualiza uma tarefa existente
   */
  async updateTask(id: string, taskData: Partial<Tarefa>) {
    const { data, error } = await supabase
      .from('tarefas')
      .update(taskData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Tarefa;
  },

  /**
   * Deleta uma tarefa
   */
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
