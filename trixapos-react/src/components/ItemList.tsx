import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { useProducts } from "../hooks/fetchers/useProducts";
import { Item } from "../types/pos";

interface ItemListProps {
  searchTerm: string;
}

export function ItemList({ searchTerm }: ItemListProps) {
  const selectedCategory = usePOSStore((state) => state.selectedCategory); // ✅ Access sidebar-selected category
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    remove,
  } = useProducts(selectedCategory, searchTerm); // ✅ Use selectedCategory in API call

  const { addToCart } = usePOSStore();
  const { ref, inView } = useInView({ threshold: 0.5 });

  const [visibleItems, setVisibleItems] = useState<Item[]>([]);
  const [containerHeight, setContainerHeight] = useState<string>("100vh");

  // ✅ Dynamic container height for scrollable area
  useEffect(() => {
    const handleResize = () => {
      const headerHeight = 160; // Adjust if needed
      const footerHeight = 80;  // Adjust if needed
      setContainerHeight(`calc(100vh - ${headerHeight + footerHeight}px)`);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Reset items on category/search change
  useEffect(() => {
    remove(); // Clear previous cached data
    setVisibleItems([]); // Reset visible items
    refetch(); // Fetch new data based on updated category/search term
  }, [selectedCategory, searchTerm, refetch, remove]);

  // ✅ Append new items for infinite scroll
  useEffect(() => {
    if (data?.pages) {
      const allItems = data.pages.flatMap((page) => page.items);
      setVisibleItems(allItems);
    }
  }, [data]);

  // ✅ Trigger fetch on scroll reach
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex-1 p-4 overflow-hidden bg-gray-100" style={{ height: containerHeight }}>
      <div className="max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleItems.map((item) => (
            <div
              key={item.item_code}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={() => addToCart({ ...item, qty: 1 })}
            >
              <img
                src={item.image || "/placeholder.png"}
                alt={item.item_name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h3 className="font-medium text-gray-900 truncate">{item.item_name}</h3>
              <p className="text-sm text-gray-600">{item.item_code}</p>
              <p className="mt-1 text-lg font-semibold text-blue-600">
                {item.price_list_rate > 0 ? `$${item.price_list_rate.toFixed(2)}` : "Price on Request"}
              </p>
              <p className="text-sm text-gray-500">Stock: {item.stock_qty}</p>
            </div>
          ))}
        </div>

        {/* ✅ Infinite Scroll Trigger */}
        {hasNextPage && (
          <div ref={ref} className="text-center text-gray-500 mt-4">
            {isFetchingNextPage ? "🔄 Loading more..." : "⬇️ Scroll to load more"}
          </div>
        )}

        {/* ✅ No Items Fallback */}
        {!visibleItems.length && !isFetchingNextPage && (
          <div className="text-center text-gray-500 mt-4">No items found. 🔍</div>
        )}
      </div>
    </div>
  );
}
