import { useInfiniteQuery } from "@tanstack/react-query"; // ✅ Ensure this is imported
import { fetchProducts } from "./posApi";
import { Item } from "../../types/pos";

/**
 * Custom Hook to fetch products with infinite scrolling.
 */
export function useProducts() {
  return useInfiniteQuery<Item[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Cache products for 5 minutes
    retry: 2, // Retry fetching up to 2 times on failure
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
    keepPreviousData: true, // Maintain previous data while fetching new
    getNextPageParam: (lastPage, allPages) => lastPage.nextCursor ?? undefined, // ✅ Add pagination
  });
}
