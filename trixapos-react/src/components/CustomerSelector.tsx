// import React, { useState, useEffect } from "react";
// import { CustomerSearch } from "./CustomerSearch";
// import { useCustomers } from "../hooks/fetchers/useCustomers";
// import { usePOSStore } from "../hooks/Stores/usePOSStore";
// import { ErrorDialog } from "./ui/ErrorDialog"; // NEW: Import our modal error dialog component

// interface Customer {
//   name: string;
//   customer_name: string;
//   territory?: string;
//   customer_group?: string;
// }

// export function CustomerSelector() {
//   const [search, setSearch] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const { setCustomer, customer, cart } = usePOSStore(); // ✅ Use POS Store

//   // NEW: State for error modal dialog
//   const [errorDialogOpen, setErrorDialogOpen] = useState(false);
//   const [errorDialogMessage, setErrorDialogMessage] = useState("");

//   const {
//     data: customers = [],
//     isLoading,
//     error,
//     refetch,
//   } = useCustomers(search);

//   useEffect(() => {
//     if (search.trim()) {
//       refetch();
//     }
//   }, [search, refetch]);

//   return (
//     <div className="w-full max-w-md mx-auto">
//       <CustomerSearch
//         search={search}
//         selectedCustomer={customer}
//         filteredCustomers={customers}
//         isOpen={isOpen}
//         onSearch={(value) => setSearch(value)}
//         onSelect={(selectedCustomer) => {
//           // Instead of calling toast.error, we open our modal error dialog
//           if (cart.length > 0) {
//             setErrorDialogMessage("Cannot change customer after adding items.");
//             setErrorDialogOpen(true);
//             return;
//           }
//           setCustomer(selectedCustomer);
//           setIsOpen(false);
//         }}
//         onClear={() => {
//           // Instead of calling toast.error, we open our modal error dialog
//           if (cart.length > 0) {
//             setErrorDialogMessage("Cannot remove customer after adding items.");
//             setErrorDialogOpen(true);
//             return;
//           }
//           setCustomer(null);
//         }}
//         onFocus={() => setIsOpen(true)}
//       />

//       {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
//       {error && <p className="text-red-500 mt-2">Error loading customers</p>}

//       {/* Render the error modal dialog when errorDialogOpen is true */}
//       {errorDialogOpen && (
//         <ErrorDialog
//           isOpen={errorDialogOpen}
//           message={errorDialogMessage}
//           onClose={() => setErrorDialogOpen(false)}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { CustomerSearch } from "./CustomerSearch";
import { useCustomers } from "../hooks/fetchers/useCustomers";
import { usePOSStore } from "../hooks/Stores/usePOSStore";
import { ErrorDialog } from "./ui/ErrorDialog";
import { Customer as POSCustomer } from "../types/pos"; // Import the Customer type from pos.ts

// Define a local Customer interface that matches CustomerSearch component's expectations
interface CustomerSearchProps {
  default_price_list: string | null; // Changed from string | undefined to string | null
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
}

export function CustomerSelector() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { setCustomer, customer, cart } = usePOSStore(); // ✅ Use POS Store

  // NEW: State for error modal dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useCustomers(search);

  useEffect(() => {
    if (search.trim()) {
      refetch();
    }
  }, [search, refetch]);

  // Convert POS Customer to CustomerSearch compatible customer
  const adaptCustomerForSearch = (customer: POSCustomer | null): CustomerSearchProps | null => {
    if (!customer) return null;
    
    return {
      name: customer.name,
      customer_name: customer.customer_name,
      default_price_list: customer.default_price_list || null,
      territory: customer.territory,
      customer_group: customer.customer_group
    };
  };

  // Convert CustomerSearch customer to POS Store compatible customer
  const adaptCustomerForStore = (customer: CustomerSearchProps): POSCustomer => {
    return {
      name: customer.name,
      customer_name: customer.customer_name,
      default_price_list: customer.default_price_list || undefined,
      territory: customer.territory,
      customer_group: customer.customer_group,
      // Add any required fields from the POS Customer type
      barcode: '' // This was missing and causing errors
    };
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <CustomerSearch
        search={search}
        selectedCustomer={adaptCustomerForSearch(customer)}
        filteredCustomers={customers.map((c: POSCustomer) => adaptCustomerForSearch(c as POSCustomer) as CustomerSearchProps)}
        isOpen={isOpen}
        onSearch={(value) => setSearch(value)}
        onSelect={(selectedCustomer) => {
          // Instead of calling toast.error, we open our modal error dialog
          if (cart.length > 0) {
            setErrorDialogMessage("Cannot change customer after adding items.");
            setErrorDialogOpen(true);
            return;
          }
          setCustomer(adaptCustomerForStore(selectedCustomer));
          setIsOpen(false);
        }}
        onClear={() => {
          // Instead of calling toast.error, we open our modal error dialog
          if (cart.length > 0) {
            setErrorDialogMessage("Cannot remove customer after adding items.");
            setErrorDialogOpen(true);
            return;
          }
          setCustomer(null);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isLoading && <p className="text-gray-500 mt-2">Loading customers...</p>}
      {error && <p className="text-red-500 mt-2">Error loading customers</p>}

      {/* Fixed error by explicitly typing the JSX element */}
      {errorDialogOpen && (
        <ErrorDialog
          isOpen={errorDialogOpen}
          message={errorDialogMessage}
          onClose={() => setErrorDialogOpen(false)}
        />
      )}
    </div>
  );
}
