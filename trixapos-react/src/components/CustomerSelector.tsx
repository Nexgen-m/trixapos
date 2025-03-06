import React, { useState, useEffect } from 'react';
import { CustomerSearch } from './CustomerSearch';
import { useCustomers } from '../hooks/fetchers/useCustomers';
import { usePOSStore } from '../hooks/Stores/usePOSStore'; // ✅ Import global store

interface Customer {
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
  default_price_list?: string; // ✅ Ensure this exists
}

export function CustomerSelector() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: customers = [], isLoading, error, refetch } = useCustomers(search);
  const setCustomer = usePOSStore((state) => state.setCustomer); // ✅ Get setCustomer from global store

  // ✅ Ensure search refetches customer list
  useEffect(() => {
    if (search.trim()) {
      refetch();
    }
  }, [search, refetch]);

  return (
    <div className="w-full max-w-md mx-auto">
      <CustomerSearch
        search={search}
        selectedCustomer={selectedCustomer}
        filteredCustomers={customers}
        isOpen={isOpen}
        onSearch={(value) => setSearch(value)}
        onSelect={(customer) => {
          // console.log("Customer selected:", customer); // ✅ Debugging step
          
          setSelectedCustomer(customer);
          setCustomer(customer); // ✅ Update global state
          setIsOpen(false);
        }}
        onClear={() => {
          setSelectedCustomer(null);
          setCustomer(null); // ✅ Clear global customer state
        }}
        onFocus={() => setIsOpen(true)}
      />

      {/* Error Handling */}
      {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
      {error && <p className="text-red-500 mt-2">Error loading customers</p>}
    </div>
  );
}
