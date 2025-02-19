import React, { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { User, Search } from "lucide-react";
import { useCustomers } from "../hooks/fetchers/useCustomers";

interface CustomerSearchProps {
  onSelect: (customer: { name: string; customer_name: string }) => void;
}

export function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const { data: customers = [], isLoading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Filter customers based on search input
  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger className="w-full flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">Search customers...</span>
      </PopoverTrigger>

      <PopoverContent className="w-full p-2 bg-white border rounded-lg shadow-md">
        <Command>
          <CommandInput
            placeholder="Search customers..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-full px-3 py-2 border rounded-md focus:outline-none"
          />
          <CommandList>
            {isLoading && <CommandItem disabled>Loading customers...</CommandItem>}
            {error && <CommandItem disabled className="text-red-500">Error loading customers</CommandItem>}
            {filteredCustomers.length === 0 ? (
              <CommandItem disabled>No customers found</CommandItem>
            ) : (
              filteredCustomers.map((customer) => (
                <CommandItem key={customer.name} onSelect={() => onSelect(customer)}>
                  {customer.customer_name}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
