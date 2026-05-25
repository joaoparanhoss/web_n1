import { useState, useEffect, useCallback } from 'react';
import { Lista } from '../types/database';
import { listService } from '../services/listService';
import { useAuthContext } from '../contexts/AuthContext';

export function useLists() {
  const { user } = useAuthContext();
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const fetchLists = useCallback(async () => {
    if (!userId) {
      setListas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await listService.getLists(userId);
      setListas(data);
    } catch (err: any) {
      console.error('Erro ao carregar listas:', err);
      setError(err.message || 'Erro ao carregar suas listas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (titulo: string, descricao: string | null = null) => {
    if (!userId) return null;
    try {
      setError(null);
      const newList = await listService.createList(titulo, userId, descricao);
      await fetchLists();
      return newList;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar a lista.');
      throw err;
    }
  };

  const updateList = async (id: string, updates: Partial<Pick<Lista, 'titulo' | 'descricao'>>) => {
    try {
      setError(null);
      const updatedList = await listService.updateList(id, updates);
      await fetchLists();
      return updatedList;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a lista.');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    try {
      setError(null);
      await listService.deleteList(id);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar a lista.');
      throw err;
    }
  };

  return { listas, loading, error, createList, updateList, deleteList, refreshLists: fetchLists };
}
