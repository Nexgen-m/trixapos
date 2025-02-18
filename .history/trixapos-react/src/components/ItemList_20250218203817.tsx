import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Item } from "../types/pos";
import { usePOSStore } from "../hooks/Stores/usePOSStore";

interface ItemListProps {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export function ItemList({ items, loading, error }: ItemListProps) {
  const { addToCart } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div className="flex-1 p-4 overflow-auto bg-gray-100">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-500">No items found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.item_code}
              className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer ${
                item.stock_qty === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => item.stock_qty > 0 && addToCart(item)}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.item_name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h3 className="font-medium text-gray-900">{item.item_name}</h3>
              <p className="text-sm text-gray-600">{item.item_code}</p>
              <p className="mt-1 text-lg font-semibold text-blue-600">
                ${item.price_list_rate.toFixed(2)}
              </p>
              <p className={`text-sm ${item.stock_qty > 0 ? "text-gray-500" : "text-red-500"}`}>
                Stock: {item.stock_qty}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
