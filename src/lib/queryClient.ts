import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Dados da API (GitHub Pages) são estáticos — não mudam entre requests.
         * staleTime alto evita refetch desnecessário. O estado mutável do
         * check-in vive no store Zustand (não no cache), então é imune a refetch.
         */
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
