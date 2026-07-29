import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = error instanceof ApiError ? error.status : 0;
          // Client errors will never succeed on retry.
          if (status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
