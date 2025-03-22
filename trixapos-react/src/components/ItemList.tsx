import React, { useState, useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { useProducts } from "../hooks/fetchers/useProducts";
import { Item } from "../types/pos";
import { ShoppingCart, Tag, Info } from "lucide-react"; // Removed Check icon
import { toast } from "sonner";
import { ItemInfoDialog } from "./ItemInfoDialog";
import { ErrorDialog } from "./ui/ErrorDialog";

interface ItemListProps {
  searchTerm: string;
}

const backendUrl = import.meta.env.VITE_FRAPPE_BASE_URL;

// Utility function to remove HTML tags from description
const stripHtmlTags = (html: string) => {
  return html.replace(/<[^>]+>/g, "");
};

export function ItemList({ searchTerm }: ItemListProps) {
  const selectedCategory = usePOSStore((state) => state.selectedCategory);
  const customer = usePOSStore((state) => state.customer);
  const isCompactMode = usePOSStore((state) => state.isCompactMode);
  const isVerticalLayout = usePOSStore((state) => state.isVerticalLayout);
  const cart = usePOSStore((state) => state.cart); // Access the `cart` state
  const { items, isLoading, hasMore, loadMore } = useProducts(
    selectedCategory,
    searchTerm,
    customer?.name || ""
  );

  const { addToCart } = usePOSStore();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // State for selected item
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false); // State for Info dialog

  // State for error popup
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  /** Adjust column count based on container width */
  useEffect(() => {
    const updateColumnCount = () => {
      if (parentRef.current) {
        const width = parentRef.current.offsetWidth;
        if (width < 640) setColumnCount(2);
        else if (width < 1024) setColumnCount(3);
        else if (width < 1280) setColumnCount(4);
        else setColumnCount(5);
      }
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  /** Dynamic row height based on compact mode */
  const rowHeight = useMemo(() => (isCompactMode ? 160 : 320), [isCompactMode]);

  /** Filter items based on vertical mode */
  const filteredItems = useMemo(() => {
    if (isVerticalLayout) {
      return items.filter((item) => item.stock_qty > 0); // Hide items with zero stock
    }
    return items;
  }, [items, isVerticalLayout]);

  /** Calculate total rows needed */
  const rows = Math.ceil(filteredItems.length / columnCount);

  /** Virtualizer Setup */
  const virtualizer = useVirtualizer({
    count: hasMore ? rows + 1 : rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + 16,
    overscan: 5,
  });

  /** Recalculate virtualizer on compact mode change */
  useEffect(() => {
    virtualizer.measure();
  }, [isCompactMode, virtualizer]);

  /** Load More when reaching bottom */
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    const lastItem = virtualItems.at(-1);

    if (!isLoading && hasMore && lastItem && lastItem.index >= rows - 1) {
      loadMore();
    }
  }, [virtualizer.getVirtualItems(), rows, hasMore, isLoading, loadMore]);

  /** logic to use error dialog */
  const handleAddToCart = (item: Item) => {
    if (!isVerticalLayout && !customer) {
      setErrorDialogMessage("Please select a customer before adding items.");
      setErrorDialogOpen(true);
      return;
    }

    if (item.price_list_rate <= 0) {
      setErrorDialogMessage(
        `Item "${item.item_name}" does not have a valid price.\nPlease contact the administrator.`
      );
      setErrorDialogOpen(true);
      return;
    }

    addToCart({ ...item, qty: 1 });
  };

  /** Helper function to get items for a specific row */
  const getItemsForRow = (rowIndex: number) => {
    const startIdx = rowIndex * columnCount;
    const endIdx = Math.min(startIdx + columnCount, filteredItems.length);
    return filteredItems.slice(startIdx, endIdx);
  };

  /** Handle Info button click */
  const handleInfoClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setSelectedItem(item); // Set the selected item
    setIsInfoDialogOpen(true); // Open the Info dialog
  };

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto bg-slate-50/50"
      key={`item-list-${isCompactMode ? "compact" : "full"}`}
    >
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowItems = getItemsForRow(virtualRow.index);
          // Skip rendering if it's just the load more sentinel and no actual items
          if (virtualRow.index >= rows) return null;

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full p-3"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  gap: "16px",
                }}
              >
                {rowItems.map((item, index) => (
                  <div
                    key={`${item.item_code}-${index}`}
                    className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col"
                    style={{ height: `${rowHeight}px` }}
                    onClick={() => handleAddToCart(item)}
                  >
                    {/* Stock Badge (Hidden in Vertical Layout) */}
                    {!isVerticalLayout && (
                      <div className="absolute top-2 right-2 z-10">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.stock_qty > 20
                              ? "bg-emerald-50 text-emerald-700"
                              : item.stock_qty > 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.stock_qty} in stock
                        </div>
                      </div>
                    )}

                    {/* Image Section (Hidden in Compact Mode) */}
                    {!isCompactMode && (
                      <div className="h-40 bg-slate-50/80 p-3 flex items-center justify-center relative">
                        {item.image ? (
                          <img
                            src={`${backendUrl}${item.image}`}
                            alt={item.item_name}
                            className="h-full w-auto object-contain group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).src = `${item.image}`;
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-semibold">
                            {item.item_name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 p-3 flex flex-col">
                      {/* Item Code & Item Group */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span>{item.item_code}</span>
                        </div>
                        {!isCompactMode && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full truncate max-w-[120px]">
                            {item.item_group}
                          </span>
                        )}
                      </div>

                      {/* Item Name */}
                      <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
                        {item.item_name}
                      </h3>

                      {/* Description (Hidden in Compact Mode) */}
                      {!isCompactMode && (
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 line-clamp-3 leading-snug mt-1">
                            {item.description
                              ? stripHtmlTags(item.description) // Remove HTML tags
                              : `High-quality ${item.item_group.toLowerCase()} item`}
                          </p>
                        </div>
                      )}

                      {/* Price & Info Button */}
                      <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-600">
                          {item.price_list_rate > 0
                            ? `$${Number(item.price_list_rate).toFixed(2)}`
                            : "Price Not Set"}
                        </span>

                        {/* Info Button */}
                        <button
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                          onClick={(e) => handleInfoClick(e, item)}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          Loading more items...
        </div>
      )}

      {/* Item Info Dialog */}
      <ItemInfoDialog
        item={selectedItem}
        isOpen={isInfoDialogOpen}
        onClose={() => setIsInfoDialogOpen(false)}
      />

      {/* NEW: Error Popup Dialog to display error messages */}
      {errorDialogOpen && (
        <ErrorDialog
          isOpen={errorDialogOpen}
          message={errorDialogMessage}
          onClose={() => setErrorDialogOpen(false)}
        />
      )}
    </div>
  );
}

