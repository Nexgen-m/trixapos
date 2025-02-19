import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "./posApi";
import { Item } from "../../types/pos";

interface ProductResponse {
  items: Item[];
  nextPage: number | null;
}

/**
 * Custom Hook to fetch products with infinite scrolling.
 */
export function useProducts() {
  return useInfiniteQuery<ProductResponse, Error>({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 1 }) => fetchProducts(pageParam),
    initialPageParam: 1, // ✅ Default page number
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined, // ✅ Handle pagination properly
    staleTime: 5 * 60 * 1000, // Cache products for 5 minutes
    retry: 2, // Retry fetching up to 2 times on failure
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
    keepPreviousData: true, // Maintain previous data while fetching new
  });
}
