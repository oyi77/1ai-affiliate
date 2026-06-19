import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Fetches campaigns list from GET /api/admin/campaigns.
 * @param {number} limit - Max rows to fetch (default 10).
 */
export function useCampaigns(limit = 10) {
  return useQuery({
    queryKey: ['campaigns', limit],
    queryFn: async () => {
      const response = await api.get(`/api/admin/campaigns?limit=${limit}`);
      // API returns { data: [...] }
      return response.data?.data ?? response.data ?? [];
    },
    refetchInterval: 60000,
  });
}
