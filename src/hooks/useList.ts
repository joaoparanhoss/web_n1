import { useState, useEffect, useCallback } from 'react';
import { Lista } from '../types/database';
import { listService } from '../services/listService';

export function useList(userId: string | undefined) {
  const [lista, setLista] = useState<Lista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await listService.getListByUser(userId);
      setLista(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lista do usuário');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    lista,
    loading,
    error,
    refreshList: fetchList
  };
}
