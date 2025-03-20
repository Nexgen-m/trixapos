import React from "react";
import { User, X, Search, AlertTriangle } from "lucide-react";

interface Customer {
  default_price_list: string | null;
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
}

interface CustomerSearchProps {
  search: string;
  selectedCustomer: Customer | null;
  filteredCustomers: Customer[]; // List of customers matching search
  isOpen: boolean; // Whether the dropdown is open
  onSearch: (value: string) => void; // Function to handle search input change
  onSelect: (customer: Customer) => void; // Function to handle customer selection
  onClear: () => void; // Function to clear selected customer
  onFocus: () => void; // Function to handle input focus
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
  // Helper function to determine if customer uses standard price list
  const usesStandardPriceList = (customer: Customer) => {
    return (
      !customer.default_price_list ||
      customer.default_price_list === "Standard Selling"
    );
  };

  return (
    <div className="w-full relative">
      {/* Hidden inputs to trick password managers */}
      <div style={{ display: "none", visibility: "hidden" }}>
        <input type="text" name="fakeusernameremembered" />
        <input type="password" name="fakepasswordremembered" />
      </div>

      {selectedCustomer?.customer_name ? (
        <div className="bg-gray-100 border border-gray-300 rounded-md p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-gray-800">
              {selectedCustomer.customer_name}
            </span>

            {/* Only show icon, no text */}
            {usesStandardPriceList(selectedCustomer)}
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
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={onFocus}
              autoComplete="off"
              name="customerSearch"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              data-form-type="other"
            />
          </form>
        </div>
      )}

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto z-[9999]">
          {filteredCustomers.slice(0, 10).length > 0 ? (
            filteredCustomers.slice(0, 10).map((customer) => (
              <button
                key={customer.name}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={() => onSelect(customer)}
              >
                <User className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {customer.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">{customer.territory}</p>
                </div>
                {usesStandardPriceList(customer)}
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
