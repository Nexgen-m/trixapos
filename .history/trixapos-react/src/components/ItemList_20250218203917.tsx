import React, { useState } from "react";
import { useProducts } from "../hooks/fetchers/useProducts";
import { Search } from "lucide-react";

export function ItemList({ addToCart }) {
  const { data: items, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

      {isLoading ? (
        <p>Loading items...</p>
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.item_code}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer"
              onClick={() => addToCart(item)}
            >
              {item.image && (
                <img src={item.image} alt={item.item_name} className="w-full h-32 object-cover rounded-md mb-2" />
              )}
              <h3 className="font-medium text-gray-900">{item.item_name}</h3>
              <p className="text-sm text-gray-600">{item.item_code}</p>
              <p className="mt-1 text-lg font-semibold text-blue-600">${item.price_list_rate.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Stock: {item.stock_qty}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
