import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Customer {
  name: string;
  customer_name: string;
}

interface CustomerSelectorProps {
  setCustomer: (customer: Customer | null) => void;
  customer: Customer | null;
}

export function CustomerSelector({ setCustomer, customer }: CustomerSelectorProps) {
  const { data: customers = [], isLoading, error } = useCustomers();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* 🔹 Customer Selector Button */}
      <button
        className="flex items-center gap-2 p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white"
        onClick={() => setOpen(true)}
      >
        <User className="h-5 w-5" />
        <span className="flex-1 text-left truncate">
          {customer ? customer.customer_name : "Select a Customer"}
        </span>
      </button>

      {/* 🔽 Command Dialog from shadcn/ui */}
      <CommandDialog open={open} onOpenChange={setOpen} className="w-full max-w-md">
        <CommandInput placeholder="Search customers..." />
        <CommandList>
          {isLoading ? (
            <CommandItem disabled>Loading customers...</CommandItem>
          ) : error ? (
            <CommandItem disabled className="text-red-500">
              Error loading customers
            </CommandItem>
          ) : customers.length === 0 ? (
            <CommandEmpty>No customers found</CommandEmpty>
          ) : (
            <CommandGroup heading="Customers">
              {customers.map((c) => (
                <CommandItem
                  key={c.name}
                  onSelect={() => {
                    setCustomer(c);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  {c.customer_name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
