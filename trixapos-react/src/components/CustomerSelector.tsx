import React, { useState, useEffect } from "react";
import { CustomerSearch } from "./CustomerSearch";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { toast } from "sonner"; // ✅ Toast notifications

interface Customer {
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
}

export function CustomerSelector() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { setCustomer, customer, cart } = usePOSStore(); // ✅ Use POS Store

  const { data: customers = [], isLoading, error, refetch } = useCustomers(search);

  useEffect(() => {
    if (search.trim()) {
      refetch();
    }
  }, [search, refetch]);

  return (
    <div className="w-full max-w-md mx-auto">
      <CustomerSearch
        search={search}
        selectedCustomer={customer}
        filteredCustomers={customers}
        isOpen={isOpen}
        onSearch={(value) => setSearch(value)}
        onSelect={(selectedCustomer) => {
          if (cart.length > 0) {
            toast.error("Cannot change customer after adding items.");
            return;
          }
          setCustomer(selectedCustomer);
          setIsOpen(false);
        }}
        onClear={() => {
          if (cart.length > 0) {
            toast.error("Cannot remove customer after adding items.");
            return;
          }
          setCustomer(null);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
      {error && <p className="text-red-500 mt-2">Error loading customers</p>}
    </div>
  );
}
