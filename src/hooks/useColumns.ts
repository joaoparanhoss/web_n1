import { useState, useEffect, useCallback } from 'react';
import { Coluna } from '../types/database';
import { columnService } from '../services/columnService';

export function useColumns(listaId?: string) {
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarColunas = useCallback(async () => {
    if (!listaId) {
      setColunas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await columnService.getColumnsByList(listaId);
      setColunas(data);
    } catch (err: any) {
      console.error('Erro ao carregar colunas:', err);
      setError(err.message || 'Erro ao carregar as colunas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [listaId]);

  useEffect(() => {
    carregarColunas();
  }, [carregarColunas]);

  const createColumn = async (titulo: string) => {
    if (!listaId) return null;
    try {
      setError(null);
      const ordem = await columnService.getNextOrdem(listaId);
      const newColumn = await columnService.createColumn({ titulo, ordem, lista_id: listaId });
      await carregarColunas();
      return newColumn;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar a coluna.');
      throw err;
    }
  };

  const updateColumn = async (id: string, updates: Partial<Pick<Coluna, 'titulo' | 'ordem'>>) => {
    try {
      setError(null);
      const updatedColumn = await columnService.updateColumn(id, updates);
      await carregarColunas();
      return updatedColumn;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a coluna.');
      throw err;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      setError(null);
      await columnService.deleteColumn(id);
      await carregarColunas();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar a coluna.');
      throw err;
    }
  };

  return { colunas, loading, error, createColumn, updateColumn, deleteColumn, carregarColunas };
}
