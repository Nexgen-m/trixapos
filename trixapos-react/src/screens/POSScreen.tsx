import React, { useState } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
import { Cart } from "../components/cart/Cart";
import { CustomerSelector } from "../components/CustomerSelector";

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemSearch = (search: string) => {
    setSearchTerm(search);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar and Customer Selector */}
      <div className="flex gap-4 p-4 bg-gray-100">
        <div className="flex-1">
          <ItemSearch
            search={searchTerm}
            onSearch={handleItemSearch}
            onClear={clearSearch}
          />
        </div>
        <div className="w-96">
          <CustomerSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-4">
        {/* Item List Section */}
        <div className="flex-1 overflow-auto mr-4">
          <ItemList searchTerm={searchTerm} />
        </div>

        {/* Cart Section */}
        <div className="w-96 flex flex-col border-l border-gray-200 bg-white">
          <Cart />
        </div>
      </div>
    </div>
  );
}
