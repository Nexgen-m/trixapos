import React from "react";
import Select from "react-select";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { User } from "lucide-react";

interface Customer {
  name: string;
  customer_name: string;
}

export function CustomerSelector() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore();

  // Format customers into react-select options
  const customerOptions = customers.map((c) => ({
    value: c.name,
    label: c.customer_name,
  }));

  return (
    <div className="relative w-full">
      {/* Search Box with Icon */}
      <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-white shadow-sm">
        <User className="h-5 w-5 text-gray-500 mr-2" />
        <div className="flex-1">
          <Select
            options={customerOptions}
            value={customerOptions.find((c) => c.value === customer?.name) || null}
            onChange={(selected) =>
              setCustomer(customers.find((c) => c.name === selected?.value) || null)
            }
            isLoading={isLoading}
            isClearable
            placeholder="Search customers..."
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (provided) => ({
                ...provided,
                border: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
              }),
              menu: (provided) => ({
                ...provided,
                zIndex: 10,
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }),
              option: (provided, { isFocused }) => ({
                ...provided,
                backgroundColor: isFocused ? "#e0f2fe" : "white",
                color: "#333",
                fontSize: "14px",
                padding: "10px",
              }),
            }}
            noOptionsMessage={() => "No customers found"}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">Error loading customers</p>
      )}
    </div>
  );
}
