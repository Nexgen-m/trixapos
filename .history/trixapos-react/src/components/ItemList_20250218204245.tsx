import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useProducts } from "../hooks/fetchers/useProducts";
import { usePOSStore } from "../hooks/stores/usePOSStore";

export function ItemList() {
  const { data: items = [], isLoading, error } = useProducts();
  const { addToCart } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Items
  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 🔹 Search Bar - Fixed at Top */}
      <div className="p-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 🔥 Grid Layout for Items */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-100">
        {error && <p className="text-red-500 text-center">Error: {error.message}</p>}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading items...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-500">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.item_code}
                className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer transition hover:shadow-md"
                onClick={() => item.stock_qty > 0 && addToCart(item)}
              >
                {/* 🖼 Image with Fixed Aspect Ratio */}
                <div className="w-full h-40 overflow-hidden rounded-md">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <h3 className="font-medium text-gray-900 mt-1 text-sm">{item.item_name}</h3>
                <p className="text-xs text-gray-600">{item.item_code}</p>
                <p className="mt-1 text-sm font-semibold text-blue-600">
                  ${item.price_list_rate.toFixed(2)}
                </p>
                <p className={`text-xs ${item.stock_qty > 0 ? "text-gray-500" : "text-red-500"}`}>
                  Stock: {item.stock_qty}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
