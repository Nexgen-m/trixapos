import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "./posApi";

export function useProducts(category: string, searchTerm: string) {
  return useInfiniteQuery(
    ["products", category, searchTerm],
    async ({ pageParam = 1 }) => {
      return await fetchProducts(pageParam, category, searchTerm);
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );
}
