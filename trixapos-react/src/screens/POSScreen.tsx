import React, { useState } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
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
    <div className="h-full flex flex-col">
      {/* Search Bar and Customer Selector */}
      <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
        <div className="flex-1">
          <ItemSearch
            search={searchTerm}
            onSearch={handleItemSearch}
            onClear={clearSearch}
          />
        </div>
        <div className="w-80">
          <CustomerSelector />
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-hidden">
        <ItemList searchTerm={searchTerm} />
      </div>
    </div>
  );
}


