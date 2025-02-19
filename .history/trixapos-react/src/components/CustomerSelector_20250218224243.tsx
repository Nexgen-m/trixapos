import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { Search } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

export function CustomerSelector({ setCustomer, customer }) {
  const { data: customers = [], isLoading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="relative w-full">
      {/* 🔍 Search Bar (Styled Like Items Search) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Command className="w-full">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search customers..."
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
          />
          {/* 📌 Dropdown List */}
          <CommandList className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
            {isLoading ? (
              <CommandItem disabled>Loading customers...</CommandItem>
            ) : error ? (
              <CommandItem disabled className="text-red-500">
                Error loading customers
              </CommandItem>
            ) : customers.length === 0 ? (
              <CommandItem disabled>No customers found</CommandItem>
            ) : (
              customers
                .filter((c) =>
                  c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((c) => (
                  <CommandItem
                    key={c.name}
                    onSelect={() => {
                      setCustomer(c);
                      setSearchTerm(c.customer_name); // Update search bar with selection
                    }}
                  >
                    {c.customer_name}
                  </CommandItem>
                ))
            )}
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
