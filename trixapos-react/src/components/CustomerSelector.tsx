import React, { useState, useEffect } from 'react';
import { CustomerSearch } from './CustomerSearch';
import { useCustomers } from '../hooks/fetchers/useCustomers';

interface Customer {
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
}

export function CustomerSelector() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: customers = [], isLoading, error, refetch } = useCustomers(search);

  // Refetch customers when search term changes
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
          setSelectedCustomer(customer);
          setIsOpen(false);
        }}
        onClear={() => setSelectedCustomer(null)}
        onFocus={() => setIsOpen(true)}
      />

      {/* Error Handling */}
      {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
      {error && <p className="text-red-500 mt-2">Error loading customers</p>}
    </div>
  );
}
