import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CustomerSelector() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore();

  return (
    <div className="relative w-full">
      <Select
        onValueChange={(value) => setCustomer(customers.find((c) => c.name === value) || null)}
      >
        <SelectTrigger className="w-full flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white shadow-sm">
          <User className="h-5 w-5 text-gray-500" />
          <SelectValue placeholder="Search customers..." />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <SelectItem disabled>Loading...</SelectItem>
          ) : error ? (
            <SelectItem disabled className="text-red-500">Error loading customers</SelectItem>
          ) : customers.length === 0 ? (
            <SelectItem disabled>No customers found</SelectItem>
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
  );
}
