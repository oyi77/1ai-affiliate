import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useStats(role) {
  return useQuery({
    queryKey: ['stats', role],
    queryFn: async () => {
      const params = role ? `?role=${role}` : '';
      const response = await api.get(`/api/admin/stats${params}`);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for near real-time
  });
}
