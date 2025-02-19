import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "./posApi";
import { Item } from "../../types/pos";

interface ProductResponse {
  items: Item[]; // ✅ Ensure API response contains items
  nextCursor?: string;
}

/**
 * Custom Hook to fetch products with infinite scrolling.
 */
export function useProducts() {
  return useInfiniteQuery<ProductResponse, Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Cache products for 5 minutes
    retry: 2, // Retry fetching up to 2 times on failure
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
    keepPreviousData: true, // Maintain previous data while fetching new
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined, // ✅ Ensure pagination works
  });
}
