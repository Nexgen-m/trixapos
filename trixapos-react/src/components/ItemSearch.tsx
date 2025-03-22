import React from 'react';
import { Search, X } from 'lucide-react';

interface ItemSearchProps {
  search: string;
  onSearch: (value: string) => void;
  onClear: () => void;
}

export function ItemSearch({ search, onSearch, onClear }: ItemSearchProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);  // Pass search term up
  };

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      {/* Input field */}
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search items..."
        value={search}
        onChange={handleSearch}  // Handle input change
      />
      {/* Clear button */}
      {search && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}

