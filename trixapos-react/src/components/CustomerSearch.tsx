import React from 'react';
import { User, X, Search } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface CustomerSearchProps {
  search: string;
  selectedCustomer: Customer | null;
  filteredCustomers: Customer[];
  isOpen: boolean;
  onSearch: (value: string) => void;
  onSelect: (customer: Customer) => void;
  onClear: () => void;
  onFocus: () => void;
}

export function CustomerSearch({
  search,
  selectedCustomer,
  filteredCustomers,
  isOpen,
  onSearch,
  onSelect,
  onClear,
  onFocus,
}: CustomerSearchProps) {
  return (
    <div className="w-full relative">
      {selectedCustomer ? (
        <div className="bg-gray-100 border border-gray-300 rounded-md p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-gray-800">{selectedCustomer.name}</span>
          </div>
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={onFocus}
          />
        </div>
      )}

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto z-10">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={() => onSelect(customer)}
              >
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">
              No customers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
