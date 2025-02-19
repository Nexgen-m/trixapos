import React from "react";
import Select from "react-select";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { User } from "lucide-react";

export function CustomerSelector() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore();

  // Format customer options for react-select
  const customerOptions = customers.map((c) => ({
    value: c.name,
    label: c.customer_name,
  }));

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-md shadow-sm">
        <User className="h-5 w-5 text-gray-500" />
        <Select
          options={customerOptions}
          value={customerOptions.find((c) => c.value === customer?.name) || null}
          onChange={(selected) => setCustomer(customers.find((c) => c.name === selected?.value) || null)}
          isLoading={isLoading}
          isClearable
          placeholder="Search customers..."
          className="flex-1"
          classNamePrefix="react-select"
          styles={{
            control: (provided) => ({
              ...provided,
              border: "none",
              boxShadow: "none",
              backgroundColor: "transparent",
            }),
          }}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">Error loading customers</p>
      )}
    </div>
  );
}
