import { useState, useEffect, useCallback } from 'react';
import { Tarefa, StatusTarefa } from '../types/database';
import { taskService } from '../services/taskService';

export function useTasks(listaId: string | undefined) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!listaId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasksByList(listaId);
      setTarefas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [listaId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (tarefa: Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em'>) => {
    try {
      setError(null);
      await taskService.createTask(tarefa);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tarefa');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Tarefa>) => {
    try {
      setError(null);
      await taskService.updateTask(id, updates);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar tarefa');
      throw err;
    }
  };

  const updateTaskStatus = async (id: string, status: StatusTarefa) => {
    try {
      setError(null);
      await taskService.updateTaskStatus(id, status);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status da tarefa');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar tarefa');
      throw err;
    }
  };

  return {
    tarefas,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    refreshTasks: fetchTasks
  };
}
