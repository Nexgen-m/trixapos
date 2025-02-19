import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./posApi";

/**
 * Custom Hook to fetch products with caching & auto-refetching.
 */
export function useProducts() {
  return useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 1 }) => fetchProducts(pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage ?? undefined, // ✅ Controls pagination
  });
}
