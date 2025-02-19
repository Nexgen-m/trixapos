import React from "react";
import { User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CustomerSearch } from "./CustomerSearch";
import { useCustomers } from "../hooks/fetchers/useCustomers";

interface CustomerSelectorProps {
  setCustomer: (customer: any | null) => void;
  customer: any | null;
}

export function CustomerSelector({ setCustomer, customer }: CustomerSelectorProps) {
  const { data: customers = [], isLoading, error } = useCustomers();

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center border rounded-md px-3 py-2 bg-white shadow-sm cursor-pointer">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{customer ? customer.customer_name : "Select a customer"}</span>
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-2 shadow-lg rounded-lg bg-white border">
          <CustomerSearch customers={customers} setCustomer={setCustomer} isLoading={isLoading} error={error} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
