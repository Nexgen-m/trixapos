import React, { useState } from "react";
import { CustomerSearch } from "./CustomerSearch";
import { User } from "lucide-react";

export function CustomerSelector() {
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; customer_name: string } | null>(null);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 p-2 bg-gray-100 border rounded-lg">
        <User className="w-5 h-5 text-gray-500" />
        <span className="text-gray-800">
          {selectedCustomer ? selectedCustomer.customer_name : "Select a customer"}
        </span>
      </div>

      <CustomerSearch onSelect={setSelectedCustomer} />
    </div>
  );
}
