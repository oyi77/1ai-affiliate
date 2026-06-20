import { useQuery } from '@tanstack/react-query';

/**
 * useSafeQuery — wraps React Query's useQuery to prevent "infinite loading"
 * when queries fail (403, 500, network error, etc.).
 *
 * Returns the same shape as useQuery, but:
 * - `data` is always defined (defaults to `fallback`)
 * - `isLoading` is only true during initial fetch
 * - `isError` is true when the query failed
 * - `error` contains the error object
 */
export function useSafeQuery(options, fallback = []) {
  const query = useQuery({
    ...options,
    retry: 1,
  });

  return {
    ...query,
    data: query.data ?? fallback,
    // isLoading should be false once we have a definitive result (success or error)
    isLoading: query.isLoading && !query.isError,
  };
}
