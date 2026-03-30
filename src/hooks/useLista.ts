import { useState, useEffect, useCallback } from 'react';
import { Lista } from '../types/database';
import { listService } from '../services/listService';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function useLista(listaId: string | undefined) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [lista, setLista] = useState<Lista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!listaId || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await listService.getListById(listaId);
      
      // Frontend security check: ensure the list exists and belongs to the user
      if (!data || data.usuario_id !== user.id) {
        navigate('/');
        return;
      }
      
      setLista(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lista');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [listaId, user, navigate]);

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
