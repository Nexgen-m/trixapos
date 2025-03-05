import { useState, useEffect, useCallback } from "react";
import { Item } from "../../types/pos";
import { fetchProducts } from "./posApi";

const PAGE_SIZE = 50;

export function useProducts(category: string, searchTerm: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /** ✅ Function to Fetch Products */
  const loadProducts = useCallback(
    async (pageNumber: number) => {
      if (isLoading) return; // Prevent duplicate requests
      setIsLoading(true);
      try {
        const { items: fetchedItems, nextPage } = await fetchProducts(
          pageNumber,
          category,
          searchTerm,
          PAGE_SIZE
        );

        setItems((prevItems) =>
          pageNumber === 1 ? fetchedItems : [...prevItems, ...fetchedItems]
        );

        // 🔄 Ensure hasMore updates correctly
        setHasMore(nextPage !== null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch products"));
      } finally {
        setIsLoading(false);
      }
    },
    [category, searchTerm, isLoading]
  );

  /** 📌 Fetch on Category/Search Change */
  useEffect(() => {
    setPage(1);
    loadProducts(1);
  }, [category, searchTerm]);

  /** 📌 Function to Load More Products */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  }, [isLoading, hasMore, page, loadProducts]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
  };
}
