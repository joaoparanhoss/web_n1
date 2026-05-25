import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuthContext } from '../contexts/AuthContext';
import { DashboardTarefa } from '../types/database';

export function useDashboard(listaId?: string) {
  const { user } = useAuthContext();
  const [tarefas, setTarefas] = useState<DashboardTarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData(userId, listaId);
      setTarefas(data);
    } catch (err: any) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err.message || 'Erro ao carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  }, [userId, listaId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { tarefas, loading, error, refresh: fetchDashboardData };
}
