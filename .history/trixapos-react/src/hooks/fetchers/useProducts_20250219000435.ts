// import { useInfiniteQuery } from "@tanstack/react-query";
// import { fetchProducts } from "../../hooks/fetchers/posApi";
// import { Item } from "../../types/pos";

// export interface ProductResponse {
//   items: Item[];
//   nextPage: number | null;
// }

// /**
//  * Custom hook to fetch paginated product data.
//  */
// export function useProducts(category: string) {
//   return useInfiniteQuery<ProductResponse, Error>({
//     queryKey: ["products"],
//     queryFn: async ({ pageParam = 1 }) => fetchProducts(pageParam, "defaultCategory"), // Handles pagination
//     getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined, // Proper pagination handling
//     staleTime: 5 * 60 * 1000, // Cache products for 5 minutes
//     retry: 2, // Retry fetching up to 2 times on failure
//     refetchOnWindowFocus: false, // Prevent refetching when switching tabs
//     keepPreviousData: true, // Maintain previous data while fetching new
//   });
// }


import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "../../hooks/fetchers/posApi";
import { Item } from "../../types/pos";

export interface ProductResponse {
  items: Item[];
  nextPage: number | null;
}

/**
 * Custom hook to fetch paginated product data.
 * Accepts a category to filter products.
 */
export function useProducts(category?: string) {
  return useInfiniteQuery<ProductResponse, Error>({
    queryKey: ["products", category], // ✅ Category is part of query key to refetch
    queryFn: async ({ pageParam = 1 }) => fetchProducts(pageParam, category ?? "defaultCategory"), // ✅ Pass category with default
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}
