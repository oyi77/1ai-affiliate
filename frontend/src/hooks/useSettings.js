import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Fetch platform settings from the API.
 * Returns safe public settings (domains, branding, etc.)
 */
export function useSettings() {
  const query = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const r = await api.get('/api/platform/public');
      return r.data?.data || {};
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  return {
    settings: query.data || {},
    isLoading: query.isLoading,
  };
}
