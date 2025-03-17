// import React, { useCallback, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { usePOSStore } from "@/hooks/Stores/usePOSStore";
// import { Calculator } from "@/components/calculator/Calculator";
// import { PaymentPage } from "@/components/payment/PaymentPage";
// import { ItemList } from "@/components/ItemList";
// import { ItemSearch } from "@/components/ItemSearch";
// import { CustomerSelector } from "@/components/CustomerSelector";
// import { Cart } from "@/components/cart/Cart";
// import { Button } from "@/components/ui/button";
// import {
//   Calculator as CalculatorIcon,
//   ShoppingCart,
//   Receipt,
//   ChevronDown,
//   ChevronUp
// } from "lucide-react";

// export function VerticalPOSScreen() {
//   const { cart, total } = usePOSStore();
//   const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("items");
//   const [isCartExpanded, setIsCartExpanded] = useState(true);
//   const handleTabChange = useCallback((tab: "items" | "customer") => {
//     setActiveTab(tab);
//   }, []);
  

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 p-4 space-y-4">
//         <ItemSearch search={searchTerm} onSearch={setSearchTerm} onClear={() => setSearchTerm("")} />
//         <div className="flex justify-around">
//         <button
//   className={`px-4 py-2 rounded-lg transition ${activeTab === "items" ? "bg-blue-600 text-white" : "text-gray-700"}`}
//   onClick={() => handleTabChange("items")}
// >
//   Items
// </button>
// <button
//   className={`px-4 py-2 rounded-lg transition ${activeTab === "customer" ? "bg-blue-600 text-white" : "text-gray-700"}`}
//   onClick={() => handleTabChange("customer")}
// >
//   Customer
// </button>

//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 overflow-hidden">
//         <AnimatePresence mode="wait">
//           {activeTab === "items" && (
//             <motion.div key="items" className="h-full p-4">
//               <ItemList searchTerm={searchTerm} />
//             </motion.div>
//           )}
//           {activeTab === "customer" && (
//             <motion.div key="customer" className="h-full p-4">
//               <CustomerSelector />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Cart Section */}
//       <div className="bg-white border-t border-gray-200">
//         {/* Cart Header */}
//         <div 
//           className="p-4 flex items-center justify-between cursor-pointer"
//           onClick={() => setIsCartExpanded(!isCartExpanded)}
//         >
//           <div className="flex items-center gap-3">
//             <ShoppingCart className="w-5 h-5 text-gray-500" />
//             <span className="font-medium">Cart Items ({cart.length})</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-lg font-bold">${total.toFixed(2)}</span>
//             {isCartExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-gray-500" />}
//           </div>
//         </div>

//         {/* Cart Items */}
//         <AnimatePresence>
//           {isCartExpanded && (
//             <motion.div className="border-t p-4">
//               <Cart />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Action Buttons */}
//         <div className="p-4 grid grid-cols-2 gap-3">
//         <Button variant="outline" onClick={() => setIsCalculatorOpen(true)} aria-label="Open calculator">
//         <CalculatorIcon className="w-4 h-4 mr-2" />
//             Calculator
//           </Button>
//           <Button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0} className="bg-blue-600 hover:bg-blue-700">
//             <Receipt className="w-4 h-4 mr-2" />
//             Pay
//           </Button>
//         </div>
//       </div>

//       {/* Calculator & Payment Modals */}
//       <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
//       <PaymentPage isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { Calculator } from "@/components/calculator/Calculator";
import { PaymentPage } from "@/components/payment/PaymentPage";
import { ItemList } from "@/components/ItemList";
import { ItemSearch } from "@/components/ItemSearch";
import { CustomerSelector } from "@/components/CustomerSelector";
import { Cart } from "@/components/cart/Cart";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, ShoppingCart, Receipt, ChevronDown, ChevronUp } from "lucide-react";

export function VerticalPOSScreen() {
  const { cart, total, isVerticalLayout } = usePOSStore();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [isCartExpanded, setIsCartExpanded] = useState(true);

  useEffect(() => {
    if (!isVerticalLayout) {
      window.location.href = "/trixapos/"; // Redirect to POSScreen if not in Vertical Mode
    }
  }, [isVerticalLayout]);

  const handleTabChange = useCallback((tab: "items" | "customer") => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        <ItemSearch search={searchTerm} onSearch={setSearchTerm} onClear={() => setSearchTerm("")} />
        <div className="flex justify-around">
          <button className={`px-4 py-2 rounded-lg transition ${activeTab === "items" ? "bg-blue-600 text-white" : "text-gray-700"}`} onClick={() => handleTabChange("items")}>
            Items
          </button>
          <button className={`px-4 py-2 rounded-lg transition ${activeTab === "customer" ? "bg-blue-600 text-white" : "text-gray-700"}`} onClick={() => handleTabChange("customer")}>
            Customer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "items" && (
            <motion.div key="items" className="h-full p-4">
              <ItemList searchTerm={searchTerm} />
            </motion.div>
          )}
          {activeTab === "customer" && (
            <motion.div key="customer" className="h-full p-4">
              <CustomerSelector />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart Section */}
      <div className="bg-white border-t border-gray-200">
        {/* Cart Header */}
        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsCartExpanded(!isCartExpanded)}>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Cart Items ({cart.length})</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
            {isCartExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-gray-500" />}
          </div>
        </div>

        {/* Cart Items */}
        <AnimatePresence>
          {isCartExpanded && (
            <motion.div className="border-t p-4">
              <Cart />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setIsCalculatorOpen(true)} aria-label="Open calculator">
            <CalculatorIcon className="w-4 h-4 mr-2" /> Calculator
          </Button>
          <Button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0} className="bg-blue-600 hover:bg-blue-700">
            <Receipt className="w-4 h-4 mr-2" /> Pay
          </Button>
        </div>
      </div>

      {/* Calculator & Payment Modals */}
      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <PaymentPage isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}
