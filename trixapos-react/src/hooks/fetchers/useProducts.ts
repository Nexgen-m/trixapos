import { useState, useEffect, useCallback } from "react";
import { Item } from "../../types/pos";
import { fetchProducts } from "./posApi";
import { usePOSStore } from "../Stores/usePOSStore";
import { toast } from "sonner";

const PAGE_SIZE = 50;

export function useProducts(category: string, searchTerm: string, customer: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [priceListInfo, setPriceListInfo] = useState<{
    price_list_used: string;
    using_standard_price: boolean;
  }>({
    price_list_used: "Standard Selling",
    using_standard_price: true
  });

  /** Fetch Products with Reset Option */
  const loadProducts = useCallback(
    async (pageNumber: number, reset: boolean = false) => {
      if (isLoading || (!reset && !hasMore)) return; // Prevent unnecessary calls
      setIsLoading(true);

      console.log(`🔍 Fetching page ${pageNumber} for category: "${category}" (Customer: ${customer})`);

      try {
        const response = await fetchProducts(
          pageNumber,
          category,
          searchTerm,
          customer, 
          PAGE_SIZE
        );

        const { items: fetchedItems, nextPage, price_list_used, using_standard_price } = response;

        // console.log(`✅ Loaded ${fetchedItems.length} items. Next page: ${nextPage}`);

        // Set price list info
        if (price_list_used) {
          setPriceListInfo({
            price_list_used,
            using_standard_price: using_standard_price || false
          });
        }

        setItems(prevItems => {
          if (reset) return fetchedItems;
          
          // Fixed: Filter out any duplicates based on item_code before appending
          const existingItemCodes = new Set(prevItems.map(item => item.item_code));
          const uniqueNewItems = fetchedItems.filter(item => !existingItemCodes.has(item.item_code));
          
          return [...prevItems, ...uniqueNewItems];
        });

        setHasMore(nextPage !== null && fetchedItems.length === PAGE_SIZE);

        console.log(`📌 hasMore updated to: ${nextPage !== null}`);
        setError(null);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch products"));
      } finally {
        setIsLoading(false);
      }
    },
    [category, searchTerm, customer, isLoading, hasMore]
  );

  /** Reset Items When Changing Category */
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setItems([]); // Ensure items reset properly
    loadProducts(1, true);
  }, [category, searchTerm, customer]);

  return { 
    items, 
    isLoading, 
    error, 
    hasMore,
    priceListInfo,
    loadMore: () => {
      if (hasMore && !isLoading) {
        setPage(prev => prev + 1);
        loadProducts(page + 1);
      }
    } 
  };
}

