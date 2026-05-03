import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuthContext } from '../contexts/AuthContext';

export function useDashboard(listaId?: string) {
  const { user } = useAuthContext();
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData(user.id, listaId);
      setTarefas(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err.message || 'Erro ao carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user, listaId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { tarefas, loading, error, refresh: fetchDashboardData };
}
