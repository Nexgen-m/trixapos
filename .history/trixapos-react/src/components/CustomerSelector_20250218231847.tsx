import React, { useState } from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [query, setQuery] = useState("");

  // Filter customers based on search query
  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span>{customer ? customer.customer_name : "Search customers..."}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput
            placeholder="Search customers..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && <CommandItem disabled>Loading customers...</CommandItem>}
            {error && <CommandItem disabled className="text-red-500">Error loading customers</CommandItem>}
            <CommandEmpty>No customers found</CommandEmpty>
            {filteredCustomers.map((c) => (
              <CommandItem
                key={c.name}
                onSelect={() => {
                  setCustomer(c);
                  setOpen(false);
                }}
              >
                {c.customer_name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
