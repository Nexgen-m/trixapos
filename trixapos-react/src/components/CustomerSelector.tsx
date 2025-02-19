import React, { useState } from 'react';
import { CustomerSearch } from './CustomerSearch';
import { useCustomers } from '../hooks/fetchers/useCustomers';

interface Customer {
  id: number;
  name: string;
  email: string;
}

export function CustomerSelector() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Filter customers based on the search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <CustomerSearch
        search={search}
        selectedCustomer={selectedCustomer}
        filteredCustomers={filteredCustomers}
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
