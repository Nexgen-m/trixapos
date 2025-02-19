import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
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
      {/* Search Input Field */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded-md">
        <User className="h-5 w-5 text-white" />
        <Command className="w-full">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search customers..."
            className="w-full bg-transparent border-none text-white focus:outline-none"
          />
          <CommandList className="absolute w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
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
