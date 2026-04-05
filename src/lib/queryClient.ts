import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos (según RFC)
      gcTime: 1000 * 60 * 10,    // 10 minutos (según RFC)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
