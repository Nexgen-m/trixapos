import React from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import { usePOSStore } from "../hooks/Stores/usePOSStore"; // ✅ Import Zustand store

export function CustomerSelector() {
  const { data: customers, isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore(); // ✅ Get `setCustomer` from Zustand store

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
              const selectedCustomer = customers?.find((c) => c.name === e.target.value);
              setCustomer(selectedCustomer || null); // ✅ Update Zustand state directly
            }}
          >
            <option value="">Select Customer</option>
            {customers?.map((c) => (
              <option key={c.name} value={c.name}>
                {c.customer_name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
