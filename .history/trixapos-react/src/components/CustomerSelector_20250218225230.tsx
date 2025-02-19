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

  // Map customer data to react-select format
  const customerOptions = customers.map((c) => ({
    value: c.name,
    label: c.customer_name,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <User className="h-5 w-5 text-gray-500" />
        <span className="text-gray-700 font-medium">Select Customer:</span>
      </div>

      <Select
        options={customerOptions}
        value={customer ? { value: customer.name, label: customer.customer_name } : null}
        onChange={(selected) => setCustomer(selected ? customers.find(c => c.name === selected.value) || null : null)}
        isLoading={isLoading}
        isClearable
        placeholder="Search customers..."
        className="react-select-container"
        classNamePrefix="react-select"
      />

      {error && <p className="text-red-500 text-sm mt-1">Error loading customers</p>}
    </div>
  );
}
