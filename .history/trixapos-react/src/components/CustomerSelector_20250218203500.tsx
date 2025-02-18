import React from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";

// Define the expected type for a customer
interface Customer {
  name: string;
  id: string; // Adjust this based on your actual data structure
}

interface CustomerSelectorProps {
  setCustomer: (customer: Customer | null) => void;
  customer: Customer | null;
}

export function CustomerSelector({ setCustomer, customer }: CustomerSelectorProps) {
  const { data: customers, isLoading, error } = useCustomers();

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-white" />
        {isLoading ? (
          <p className="text-white">Loading customers...</p>
        ) : error ? (
          <p className="text-red-500">Error loading customers</p>
        ) : (
          <select
            className="flex-1 p-2 border border-gray-700 rounded-md bg-white text-gray-900"
            value={customer?.name || ""}
            onChange={(e) => {
              const selected = customers?.find((c: Customer) => c.name === e.target.value);
              setCustomer(selected || null);
            }}
          >
            <option value="">Select Customer</option>
            {customers?.map((c: Customer) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
