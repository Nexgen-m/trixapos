import React from "react";
import Select from "react-select";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";

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

  // 🔹 Convert customers into options for react-select
  const customerOptions = customers.map((c) => ({
    value: c.name,
    label: c.customer_name,
  }));

  return (
    <div className="w-full">
      {/* 🔹 Searchable Select Box */}
      <div className="relative flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white">
        <User className="h-5 w-5 text-gray-400" />
        <Select
          options={customerOptions}
          isLoading={isLoading}
          isClearable
          placeholder="Search customers..."
          className="react-select-container flex-1"
          classNamePrefix="react-select"
          value={customer ? { value: customer.name, label: customer.customer_name } : null}
          onChange={(selected) =>
            setCustomer(selected ? customers.find((c) => c.name === selected.value) || null : null)
          }
        />
      </div>

      {/* 🔥 Error Handling */}
      {typeof error === "string" && (
        <p className="text-red-500 text-sm mt-1">Error loading customers</p>
      )}
    </div>
  );
}
