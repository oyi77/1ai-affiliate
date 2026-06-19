import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Fetches recent clicks from GET /api/admin/clicks.
 * @param {number} limit - Max rows to fetch (default 5).
 */
export function useClicks(limit = 5) {
  return useQuery({
    queryKey: ['clicks', limit],
    queryFn: async () => {
      const response = await api.get(`/api/admin/clicks?limit=${limit}&page=1`);
      return response.data;
    },
    refetchInterval: 30000,
  });
}
