// import React, { useState } from "react";
// import { Search } from "lucide-react";
// import { useProducts } from "../hooks/fetchers/useProducts";
// import { usePOSStore } from "../hooks/Stores/usePOSStore";
// import { useInView } from "react-intersection-observer";
// import { Item } from "../types/pos"; // ✅ Ensure correct type import

// export function ItemList() {
//   const category = "default"; // or any category you want to use
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProducts(category);
//   const { addToCart } = usePOSStore();
//   const [searchTerm, setSearchTerm] = useState("");

//   const { ref, inView } = useInView({ threshold: 1 });

//   // ✅ If user scrolls near the bottom, load more
//   React.useEffect(() => {
//     if (inView && hasNextPage) fetchNextPage();
//   }, [inView, hasNextPage, fetchNextPage]);

//   return (
//     <div className="flex-1 p-4 overflow-auto bg-gray-100">
//       {/* Search Bar */}
//       <div className="mb-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search items..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Items Grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {data?.pages.flatMap((page) =>
//           (page.items ?? []) // ✅ Ensure items exist
//             .filter((item: Item) =>
//               item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
//             )
//             .map((item: Item) => (
//               <div
//                 key={item.item_code}
//                 className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer"
//                 onClick={() => addToCart({ ...item, qty: 1 })}
//               >
//                 <img
//                   src={item.image || "/placeholder.png"}
//                   alt={item.item_name}
//                   className="w-full h-32 object-cover rounded-md mb-2"
//                 />
//                 <h3 className="font-medium text-gray-900">{item.item_name}</h3>
//                 <p className="text-sm text-gray-600">{item.item_code}</p>
//                 <p className="mt-1 text-lg font-semibold text-blue-600">
//                   ${item.price_list_rate.toFixed(2)}
//                 </p>
//                 <p className="text-sm text-gray-500">Stock: {item.stock_qty}</p>
//               </div>
//             ))
//         )}
//       </div>

//       {/* Infinite Scroll Loader */}
//       {hasNextPage && (
//         <div ref={ref} className="text-center text-gray-500 mt-4">
//           {isFetchingNextPage ? "Loading more..." : "Scroll to load more"}
//         </div>
//       )}
//     </div>
//   );
// }


