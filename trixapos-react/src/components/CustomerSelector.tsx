import React, { useState, useEffect } from "react";
import { CustomerSearch } from "./CustomerSearch";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { ErrorDialog } from "./ui/ErrorDialog"; // NEW: Import our modal error dialog component

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

  // NEW: State for error modal dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useCustomers(search);

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
          // Instead of calling toast.error, we open our modal error dialog
          if (cart.length > 0) {
            setErrorDialogMessage("Cannot change customer after adding items.");
            setErrorDialogOpen(true);
            return;
          }
          setCustomer(selectedCustomer);
          setIsOpen(false);
        }}
        onClear={() => {
          // Instead of calling toast.error, we open our modal error dialog
          if (cart.length > 0) {
            setErrorDialogMessage("Cannot remove customer after adding items.");
            setErrorDialogOpen(true);
            return;
          }
          setCustomer(null);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
      {error && <p className="text-red-500 mt-2">Error loading customers</p>}

      {/* Render the error modal dialog when errorDialogOpen is true */}
      {errorDialogOpen && (
        <ErrorDialog
          isOpen={errorDialogOpen}
          message={errorDialogMessage}
          onClose={() => setErrorDialogOpen(false)}
        />
      )}
    </div>
  );
}
