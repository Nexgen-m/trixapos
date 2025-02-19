import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

export function CustomerSelector() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const { customer, setCustomer } = usePOSStore();

  return (
    <div className="relative w-full">
      {/* Customer Selection Dropdown */}
      <Select
        onValueChange={(value) => setCustomer(customers.find((c) => c.name === value) || null)}
        value={customer?.name || ""}
      >
        {/* Search Input Field */}
        <SelectTrigger className="w-full flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500">
          <User className="h-5 w-5 text-gray-500" />
          <SelectValue placeholder="Search customers..." />
        </SelectTrigger>

        {/* Dropdown List */}
        <SelectContent className="max-h-60 overflow-y-auto border border-gray-300 bg-white rounded-lg shadow-lg">
          {isLoading ? (
            <SelectItem value="" disabled>Loading customers...</SelectItem>
          ) : error ? (
            <SelectItem value="" disabled className="text-red-500">
              Error loading customers
            </SelectItem>
          ) : customers.length === 0 ? (
            <SelectItem value="" disabled>No customers found</SelectItem>
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
