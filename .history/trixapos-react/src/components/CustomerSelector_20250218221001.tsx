import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User, Search } from "lucide-react";
import { usePOSStore } from "../hooks/Stores/usePOSStore";

export function CustomerSelector() {
  const { data: customers, isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter customers based on search input
  const filteredCustomers = customers?.filter((c) =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-800 relative">
      <div className="flex items-center gap-2 mb-2">
        <User className="h-5 w-5 text-white" />
        {isLoading ? (
          <p className="text-white">Loading customers...</p>
        ) : error ? (
          <p className="text-red-500">Error loading customers</p>
        ) : (
          <div className="relative w-full">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Select Dropdown */}
            <select
              className="w-full p-2 border border-gray-700 rounded-md bg-white text-gray-900"
              value={customer?.name || ""}
              onChange={(e) => {
                const selectedCustomer = customers?.find((c) => c.name === e.target.value);
                setCustomer(selectedCustomer || null);
                setSearchTerm(""); // Reset search after selection
              }}
            >
              {/* Placeholder: Not selectable */}
              <option value="" disabled hidden>
                Select Customer
              </option>

              {/* Display filtered customers */}
              {filteredCustomers?.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.customer_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
