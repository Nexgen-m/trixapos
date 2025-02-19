import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import { Command, CommandInput, CommandList, CommandItem } from "cmdk";

export function CustomerSelector({ setCustomer, customer }) {
  const { data: customers = [], isLoading, error } = useCustomers();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded-md">
        <User className="h-5 w-5 text-white" />
        <button
          className="text-white flex-1 text-left"
          onClick={() => setOpen(!open)}
        >
          {customer ? customer.customer_name : "Select a Customer"}
        </button>
      </div>

      {/* 🔽 Command Dropdown */}
      {open && (
        <Command className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <CommandInput placeholder="Search customer..." />
          <CommandList>
            {isLoading ? (
              <CommandItem disabled>Loading customers...</CommandItem>
            ) : error ? (
              <CommandItem disabled className="text-red-500">
                Error loading customers
              </CommandItem>
            ) : customers.length === 0 ? (
              <CommandItem disabled>No customers found</CommandItem>
            ) : (
              customers.map((c) => (
                <CommandItem
                  key={c.name}
                  onSelect={() => {
                    setCustomer(c);
                    setOpen(false);
                  }}
                >
                  {c.customer_name}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      )}
    </div>
  );
}
