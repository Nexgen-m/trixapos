import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./posApi";

/**
 * Custom Hook to fetch products with caching & auto-refetching.
 */
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Cache products for 5 minutes
    retry: 2,
  });
}
