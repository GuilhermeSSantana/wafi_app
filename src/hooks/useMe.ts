import { useState, useEffect, useCallback } from 'react';
import { settingsService, UserSettings } from '@services/settings.service';
import { UserRole } from '@types';

interface UseMeResult {
  user: UserSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isAdmin: boolean;
  hasCouple: boolean;
}

export const useMe = (): UseMeResult => {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getMe();
      setUser(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dados do usuário';
      setError(errorMessage);
      setUser(null);
      // Não mostrar toast aqui para evitar spam em caso de erro de autenticação
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === 'ADMIN';
  const hasCouple = !!user?.couple && user.couple.isActive;

  return {
    user,
    loading,
    error,
    refetch,
    isAdmin,
    hasCouple,
  };
};

