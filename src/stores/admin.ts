import { QueryClient } from "@tanstack/query-core";

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});
