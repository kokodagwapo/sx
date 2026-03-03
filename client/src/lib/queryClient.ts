import { QueryClient } from "@tanstack/react-query";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => fetcher(queryKey[0] as string),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});
