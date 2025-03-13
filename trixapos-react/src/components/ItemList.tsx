// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import { usePOSStore } from "../hooks/Stores/usePOSStore";
// import { useProducts } from "../hooks/fetchers/useProducts";
// import { Item } from "../types/pos";
// import { ShoppingCart, Tag } from "lucide-react";
// import { toast } from "sonner"; // ✅ Import toast for error messages

// interface ItemListProps {
//   searchTerm: string;
// }

// const backendUrl = import.meta.env.VITE_FRAPPE_BASE_URL;

// export function ItemList({ searchTerm }: ItemListProps) {
//   const selectedCategory = usePOSStore((state) => state.selectedCategory);
//   const customer = usePOSStore((state) => state.customer); // ✅ Get selected customer
//   const { items, isLoading, hasMore, loadMore } = useProducts(
//     selectedCategory,
//     searchTerm,
//     customer?.name || "" // ✅ Pass customer to fetch correct price list
//   );
  
//   const { addToCart } = usePOSStore();

//   const parentRef = useRef<HTMLDivElement>(null);
//   const [columnCount, setColumnCount] = useState(4);

//   /** Adjust column count based on container width */
//   useEffect(() => {
//     const updateColumnCount = () => {
//       if (parentRef.current) {
//         const width = parentRef.current.offsetWidth;
//         if (width < 640) setColumnCount(2);
//         else if (width < 1024) setColumnCount(3);
//         else if (width < 1280) setColumnCount(4);
//         else setColumnCount(5);
//       }
//     };


//     updateColumnCount();
//     window.addEventListener("resize", updateColumnCount);
//     return () => window.removeEventListener("resize", updateColumnCount);
//   }, []);

//   /** Dynamic row height */
//   const rowHeight = useMemo(() => 320, []);

//   /** Calculate total rows needed */
//   const rows = Math.ceil(items.length / columnCount);

//   /** Virtualizer Setup */
//   const virtualizer = useVirtualizer({
//     count: hasMore ? rows + 1 : rows,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => rowHeight + 16,
//     overscan: 5,
//   });

//   /** Load More when reaching bottom */
//   useEffect(() => {
//     const lastItem = virtualizer.getVirtualItems().at(-1);
//     if (lastItem && lastItem.index >= rows - 1 && hasMore && !isLoading) {
//       loadMore();
//     }
//   }, [virtualizer.getVirtualItems(), rows, hasMore, isLoading, loadMore]);

//   /** Prevent adding items without customer selection */
//   const handleAddToCart = (item: Item) => {
//     if (!customer) {
//       toast.error("Please select a customer before adding items.");
//       return;
//     }

//     if (item.price_list_rate <= 0) {
//       toast.error(`Item "${item.item_name}" does not have a valid price.`);
//       return;
//     }

//     addToCart({ ...item, qty: 1 });
//   };

//   return (
//     <div ref={parentRef} className="h-full overflow-auto bg-slate-50/50">
//       <div className="p-3">
//         <div className="grid" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, gap: '16px' }}>
//           {items.map((item) => (
//             <div
//               key={item.item_code}
//               className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col"
//               style={{ height: `${rowHeight}px` }}
//               onClick={() => handleAddToCart(item)} // ✅ Use new function
//             >
//               {/* Stock Badge */}
//               <div className="absolute top-2 right-2 z-10">
//                 <div
//                   className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     item.stock_qty > 20
//                       ? "bg-emerald-50 text-emerald-700"
//                       : item.stock_qty > 5
//                       ? "bg-amber-50 text-amber-700"
//                       : "bg-rose-50 text-rose-700"
//                   }`}
//                 >
//                   {item.stock_qty} in stock
//                 </div>
//               </div>

//               {/* Image Section */}
//               <div className="h-40 bg-slate-50/80 p-3 flex items-center justify-center relative">
//                 {item.image ? (
//                   <img
//                     src={`${backendUrl}${item.image}`}
//                     alt={item.item_name}
//                     className="h-full w-auto object-contain group-hover:scale-105 transition-transform"
//                     loading="lazy"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = `${item.image}`;
//                     }}
//                   />
//                 ) : (
//                   <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-semibold">
//                     {item.item_name}
//                   </div>
//                 )}
//               </div>

//               {/* Content Section */}
//               <div className="flex-1 p-3 flex flex-col">
//                 {/* ✅ Item Code & Item Group */}
//                 <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//                   <div className="flex items-center gap-1">
//                     <Tag className="w-4 h-4 text-blue-600" />
//                     <span>{item.item_code}</span>
//                   </div>
//                   <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full truncate max-w-[120px]">
//                     {item.item_group}
//                   </span>
//                 </div>

//                 {/* ✅ Item Name */}
//                 <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
//                   {item.item_name}
//                 </h3>

//                 {/* ✅ Flexible Padding Below Price */}
//                 <div className="flex-1">
//                   <p className="text-xs text-slate-500 line-clamp-3 leading-snug mt-1">
//                     {item.description
//                       ? item.description.replace(/<[^>]+>/g, "") // Strip HTML tags
//                       : `High-quality ${item.item_group.toLowerCase()} item`}
//                   </p>
//                 </div>

//                 {/* ✅ Price & Cart Button Adjusted to Stay at Bottom */}
//                 <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between">
//                   <span className="text-lg font-semibold text-blue-600">
//                     {item.price_list_rate > 0 ? `$${Number(item.price_list_rate).toFixed(2)}` : 'Price Not Set'}
//                   </span>

//                   <button
//                     className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleAddToCart(item); // ✅ Prevents adding if no customer
//                     }}
//                   >
//                     <ShoppingCart className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { useProducts } from "../hooks/fetchers/useProducts";
import { Item } from "../types/pos";
import { ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";

interface ItemListProps {
  searchTerm: string;
}

const backendUrl = import.meta.env.VITE_FRAPPE_BASE_URL;

export function ItemList({ searchTerm }: ItemListProps) {
  const selectedCategory = usePOSStore((state) => state.selectedCategory);
  const customer = usePOSStore((state) => state.customer);
  const { items, isLoading, hasMore, loadMore } = useProducts(
    selectedCategory,
    searchTerm,
    customer?.name || ""
  );
  
  const { addToCart } = usePOSStore();

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

  /** Dynamic row height */
  const rowHeight = useMemo(() => 320, []);

  /** Calculate total rows needed */
  const rows = Math.ceil(items.length / columnCount);

  /** Virtualizer Setup */
  const virtualizer = useVirtualizer({
    count: hasMore ? rows + 1 : rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + 16,
    overscan: 5,
  });

  /** Load More when reaching bottom */
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (lastItem && lastItem.index >= rows - 1 && hasMore && !isLoading) {
      loadMore();
    }
  }, [virtualizer.getVirtualItems(), rows, hasMore, isLoading, loadMore]);

  /** Prevent adding items without customer selection */
  const handleAddToCart = (item: Item) => {
    if (!customer) {
      toast.error("Please select a customer before adding items.");
      return;
    }

    if (item.price_list_rate <= 0) {
      toast.error(`Item "${item.item_name}" does not have a valid price.`);
      return;
    }

    addToCart({ ...item, qty: 1 });
  };

  return (
    <div ref={parentRef} className="h-full overflow-auto bg-slate-50/50">
      <div className="p-3">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, gap: '16px' }}>
          {items.map((item, index) => (
            <div
              key={`${item.item_code}-${index}`}
              className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col"
              style={{ height: `${rowHeight}px` }}
              onClick={() => handleAddToCart(item)}>
              {/* Stock Badge */}
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

              {/* Image Section */}
              <div className="h-40 bg-slate-50/80 p-3 flex items-center justify-center relative">
                {item.image ? (
                  <img
                    src={`${backendUrl}${item.image}`}
                    alt={item.item_name}
                    className="h-full w-auto object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `${item.image}`;
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-semibold">
                    {item.item_name}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 p-3 flex flex-col">
                {/* Item Code & Item Group */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>{item.item_code}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full truncate max-w-[120px]">
                    {item.item_group}
                  </span>
                </div>

                {/* Item Name */}
                <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
                  {item.item_name}
                </h3>

                {/* Flexible Padding Below Price */}
                <div className="flex-1">
                  <p className="text-xs text-slate-500 line-clamp-3 leading-snug mt-1">
                    {item.description
                      ? item.description.replace(/<[^>]+>/g, "")
                      : `High-quality ${item.item_group.toLowerCase()} item`}
                  </p>
                </div>

                {/* Price & Cart Button Adjusted to Stay at Bottom */}
                <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-600">
                    {item.price_list_rate > 0 ? `$${Number(item.price_list_rate).toFixed(2)}` : 'Price Not Set'}
                  </span>

                  <button
                    className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}