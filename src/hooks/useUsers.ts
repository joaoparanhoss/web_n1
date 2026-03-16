import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '../types/database';
import { userService } from '../services/userService';

export function useUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (usuario: Omit<Usuario, 'id' | 'criado_em'>) => {
    try {
      setError(null);
      await userService.createUser(usuario);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<Usuario>) => {
    try {
      setError(null);
      await userService.updateUser(id, updates);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuário');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar usuário');
      throw err;
    }
  };

  return {
    usuarios,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers
  };
}
