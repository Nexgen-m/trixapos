import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import { Command, CommandInput, CommandGroup, CommandItem } from "@/components/ui/command";

interface Customer {
  name: string;
  customer_name: string;
}

interface CustomerSelectorProps {
  setCustomer: (customer: Customer | null) => void;
  customer: Customer | null;
}

export function CustomerSelector({ setCustomer, customer }: CustomerSelectorProps) {
  const { data: customers, isLoading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-white" />
        {isLoading ? (
          <p className="text-white">Loading customers...</p>
        ) : error ? (
          <p className="text-red-500">Error loading customers</p>
        ) : (
          <Command className="w-full max-w-md bg-white border border-gray-200 rounded-md shadow-md">
            <CommandInput
              placeholder="Search Customer..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandGroup heading="Customers">
              {customers
                ?.filter((c) =>
                  c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((c) => (
                  <CommandItem key={c.name} onSelect={() => setCustomer(c)}>
                    {c.customer_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        )}
      </div>
    </div>
  );
}
