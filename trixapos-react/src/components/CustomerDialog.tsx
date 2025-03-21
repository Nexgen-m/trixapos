// import React, { useState, useEffect, useRef } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { call } from "@/lib/frappe"; // Using frappe-js-sdk
// import { useCustomerMeta, useCustomerGroups } from "@/hooks/fetchers/useCustomers";

// interface CustomerDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function CustomerDialog({ isOpen, onClose }: CustomerDialogProps) {
//   const [customerName, setCustomerName] = useState("");
//   const [customerType, setCustomerType] = useState("");
//   const [customerGroup, setCustomerGroup] = useState("");
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const firstInputRef = useRef<HTMLInputElement>(null);

//   // Fetch Customer doctype meta
//   const { data: metaData, isLoading: isMetaLoading } = useCustomerMeta();

//   // Fetch Customer Groups
//   const { data: customerGroups, isLoading: isCustomerGroupsLoading } = useCustomerGroups();

//   const mandatoryFields = metaData?.mandatoryFields || [];
//   const customerTypes = metaData?.customer_type_options || [];

//   // Autofocus on the first input when the dialog opens
//   useEffect(() => {
//     if (isOpen && firstInputRef.current) {
//       firstInputRef.current.focus();
//     }
//   }, [isOpen]);

//   // Reset form fields and messages when the dialog closes
//   const resetForm = () => {
//     setCustomerName("");
//     setCustomerType("");
//     setCustomerGroup("");
//     setError("");
//     setSuccessMessage("");
//   };

//   useEffect(() => {
//     if (!isOpen) {
//       resetForm();
//     }
//   }, [isOpen]);

//   const handleSubmit = async () => {
//     if (!customerName || !customerType || !customerGroup) {
//       setError("All fields are mandatory.");
//       return;
//     }
  
//     setError("");
//     setIsLoading(true);
  
//     try {
//       const response = await call.post("trixapos.api.customer_api.create_customer", {
//         customer_name: customerName,
//         customer_type: customerType,
//         customer_group: customerGroup,
//       });
  
//       if (response?.message?.name) {
//         setSuccessMessage("Customer created successfully!");
//         setTimeout(() => {
//           onClose();
//         }, 2000);
//       } else if (response?.error) {
//         setError(response.error); // Display specific error message from the API
//       } else {
//         setError("Failed to create customer. Try again.");
//       }
//     } catch (err) {
//       console.error("API Error:", err);
//       setError("An error occurred. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // Keyboard accessibility: Submit on Enter, close on Escape
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Enter" && !isLoading) {
//         handleSubmit();
//       }
//       if (e.key === "Escape") {
//         onClose();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isLoading, handleSubmit, onClose]);

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Add New Customer</DialogTitle>
//           <DialogDescription>Enter customer details to create a new record.</DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           {/* Customer Name */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">
//               Customer Name {mandatoryFields.includes("customer_name") && <span className="text-red-500">*</span>}
//             </label>
//             <Input
//               ref={firstInputRef}
//               placeholder="Enter customer name"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//               disabled={isLoading || isMetaLoading || isCustomerGroupsLoading}
//             />
//           </div>

//           {/* Customer Type */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">
//               Customer Type {mandatoryFields.includes("customer_type") && <span className="text-red-500">*</span>}
//             </label>
//             <select
//               value={customerType}
//               onChange={(e) => setCustomerType(e.target.value)}
//               className="w-full p-2 border rounded-lg"
//               disabled={isLoading || isMetaLoading || isCustomerGroupsLoading}
//             >
//               <option value="">Select Customer Type</option>
//               {customerTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Customer Group */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">
//               Customer Group {mandatoryFields.includes("customer_group") && <span className="text-red-500">*</span>}
//             </label>
//             <select
//               value={customerGroup}
//               onChange={(e) => setCustomerGroup(e.target.value)}
//               className="w-full p-2 border rounded-lg"
//               disabled={isLoading || isMetaLoading || isCustomerGroupsLoading}
//             >
//               <option value="">Select Customer Group</option>
//               {customerGroups?.map((group) => (
//                 <option key={group} value={group}>
//                   {group}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Error and Success Messages */}
//           {error && <p className="text-red-500 text-sm">{error}</p>}
//           {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-2 mt-4">
//           <Button variant="outline" onClick={onClose} disabled={isLoading || isMetaLoading || isCustomerGroupsLoading}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={isLoading || isMetaLoading || isCustomerGroupsLoading}>
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               "Save Customer"
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFrappeAuth, useFrappePostCall } from "frappe-react-sdk";
import { useCustomerMeta, useCustomerGroups } from "@/hooks/fetchers/useCustomers";

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDialog({ isOpen, onClose }: CustomerDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [customerGroup, setCustomerGroup] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  const { currentUser, isValidating } = useFrappeAuth();
  const isLoggedIn = !!currentUser;

  const { data: metaData, isLoading: isMetaLoading } = useCustomerMeta();
  const { data: customerGroups, isLoading: isCustomerGroupsLoading } = useCustomerGroups();

  const {
    call: createCustomer,
    loading: isCreating,
    error,
  } = useFrappePostCall("trixapos.api.customer_api.create_customer");

  const mandatoryFields = metaData?.mandatoryFields || [];
  const customerTypes = metaData?.customer_type_options || [];

  const isFormDisabled = isCreating || isMetaLoading || isCustomerGroupsLoading;

  useEffect(() => {
    if (isOpen && firstInputRef.current) firstInputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCustomerName("");
      setCustomerType("");
      setCustomerGroup("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!customerName || !customerType || !customerGroup) return;

    if (!isLoggedIn || isValidating) return;

    try {
      const response = await createCustomer({
        customer_name: customerName,
        customer_type: customerType,
        customer_group: customerGroup,
      });

      console.log("✅ API Response:", response);
    } catch (err) {
      console.error("❌ API call failed:", err);
    }
  };

  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomerType(e.target.value);
  };

  const handleCustomerGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomerGroup(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Enter customer details to create a new record.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Customer Name {mandatoryFields.includes("customer_name") && <span className="text-red-500">*</span>}
            </label>
            <Input
              ref={firstInputRef}
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Customer Type {mandatoryFields.includes("customer_type") && <span className="text-red-500">*</span>}
            </label>
            <select value={customerType} onChange={handleCustomerTypeChange} className="w-full p-2 border rounded-lg" disabled={isFormDisabled}>
              <option value="">Select Customer Type</option>
              {customerTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Customer Group {mandatoryFields.includes("customer_group") && <span className="text-red-500">*</span>}
            </label>
            <select value={customerGroup} onChange={handleCustomerGroupChange} className="w-full p-2 border rounded-lg" disabled={isFormDisabled}>
              <option value="">Select Customer Group</option>
              {customerGroups?.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Show errors */}
          {error && <p className="text-red-500 text-sm">{error.message || "Failed to create customer."}</p>}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isFormDisabled}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Customer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



