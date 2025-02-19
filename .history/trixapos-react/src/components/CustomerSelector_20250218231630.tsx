import React from "react";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { User } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700">Customer</label>
      <div className="relative">
        <Select
          value={customer?.name || ""}
          onValueChange={(selectedValue) => {
            const selectedCustomer = customers.find((c) => c.name === selectedValue);
            setCustomer(selectedCustomer || null);
          }}
        >
          <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <SelectValue placeholder="Search customers..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading customers...
              </SelectItem>
            ) : error ? (
              <SelectItem value="error" disabled className="text-red-500">
                Error loading customers
              </SelectItem>
            ) : customers.length === 0 ? (
              <SelectItem value="empty" disabled>
                No customers found
              </SelectItem>
            ) : (
              customers.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.customer_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
