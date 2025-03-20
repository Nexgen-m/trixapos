// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { usePOSStore } from "@/hooks/Stores/usePOSStore";
// import { PaymentPage } from "@/components/payment/PaymentPage";
// import { PrePaymentPage } from "@/components/payment/PrePaymentPage";
// import { ItemList } from "@/components/ItemList";
// import { ItemSearch } from "@/components/ItemSearch";
// import { Button } from "@/components/ui/button";
// import {
//   ShoppingCart,
//   Package,
//   Minus,
//   Plus,
//   Trash2,
//   Receipt,
//   ChevronDown,
//   ChevronUp,
//   Grid,
// } from "lucide-react";
// import { getCategoryEmoji } from "../components/layout/categoryIcons"; // Import the icon function

// interface ItemGroup {
//   name: string;
//   parent_item_group?: string;
// }

// interface GroupedCategories {
//   [parent: string]: ItemGroup[];
// }

// export function VerticalPOSScreen() {
//   const {
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     total,
//     selectedCategory,
//     setSelectedCategory,
//   } = usePOSStore();

//   const [isPrePaymentOpen, setIsPrePaymentOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isCartExpanded, setIsCartExpanded] = useState(false);
//   const [categories, setCategories] = useState<GroupedCategories>({});
//   const [loading, setLoading] = useState(true);

//   const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
//   const handleSkip = () => {
//     setIsPrePaymentOpen(false); // Close PrePaymentPage
//     setIsPaymentOpen(true); // Open PaymentPage
//   };
  

//   // Fetch item groups from Frappe API
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch(
//           "/api/method/frappe.client.get_list?doctype=Item Group&fields=[\"name\",\"parent_item_group\"]"
//         );
//         const result = await response.json();

//         if (result.message) {
//           // Group categories based on parent
//           const grouped: GroupedCategories = {};
//           result.message.forEach((category: ItemGroup) => {
//             const parent = category.parent_item_group || "root";
//             if (!grouped[parent]) grouped[parent] = [];
//             grouped[parent].push(category);
//           });

//           // Remove the "root" parent if it doesn't exist in the data
//           if (grouped["root"] && grouped["root"].length === 0) {
//             delete grouped["root"];
//           }

//           setCategories(grouped);
//         }
//       } catch (error) {
//         console.error("Failed to fetch categories:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handlePayClick = () => {
//     setIsPrePaymentOpen(true); // Open PrePaymentPage
//   };

//   const handlePrePaymentClose = () => {
//     setIsPrePaymentOpen(false); // Close PrePaymentPage
//     setIsPaymentOpen(false); // Close PaymentPage
//   };

//   const handleProceedToPayment = () => {
//     setIsPrePaymentOpen(false); // Close PrePaymentPage
//     setIsPaymentOpen(true); // Open PaymentPage
//   };

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Top Bar */}
//       <div className="bg-white border-b border-gray-200 p-4 space-y-4">
//         {/* Search Bar */}
//         <div className="flex items-center gap-4">
//           <div className="flex-1">
//             <ItemSearch
//               search={searchTerm}
//               onSearch={(value) => setSearchTerm(value)}
//               onClear={() => setSearchTerm("")}
//             />
//           </div>
//         </div>

//         {/* Category Slider */}
//         <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
//           <Button
//             variant={selectedCategory === "" ? "default" : "outline"}
//             className="flex-shrink-0 h-20 px-6 flex flex-col items-center gap-2"
//             onClick={() => setSelectedCategory("")}
//           >
//             <Grid className="w-6 h-6" />
//             <span>All Items</span>
//           </Button>
//           {Object.entries(categories).map(([parent, subCategories]) => {
//             // Skip the "root" parent category
//             if (parent === "root") return null;

//             return (
//               <Button
//                 key={parent}
//                 variant={selectedCategory === parent ? "default" : "outline"}
//                 className="flex-shrink-0 h-20 px-6 flex flex-col items-center gap-2"
//                 onClick={() => setSelectedCategory(parent)}
//               >
//                 <span className="text-2xl">{getCategoryEmoji(parent)}</span>
//                 <span>{parent}</span>
//               </Button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 overflow-hidden">
//         <ItemList searchTerm={searchTerm} />
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
//             <span className="font-medium">Cart Items ({itemCount})</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-lg font-bold">${total.toFixed(2)}</span>
//             {isCartExpanded ? (
//               <ChevronDown className="w-5 h-5 text-gray-500" />
//             ) : (
//               <ChevronUp className="w-5 h-5 text-gray-500" />
//             )}
//           </div>
//         </div>

//         {/* Cart Items */}
//         <AnimatePresence>
//           {isCartExpanded && (
//             <motion.div
//               initial={{ height: 0 }}
//               animate={{ height: "auto" }}
//               exit={{ height: 0 }}
//               className="overflow-hidden border-t border-gray-100"
//             >
//               <div className="p-4 space-y-4 max-h-[40vh] overflow-auto">
//                 {cart.length === 0 ? (
//                   <div className="text-center py-6 text-gray-500">
//                     <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
//                     <p>Your cart is empty</p>
//                   </div>
//                 ) : (
//                   cart.map((item) => (
//                     <div
//                       key={item.item_code}
//                       className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
//                     >
//                       <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
//                         {item.image ? (
//                           <img
//                             src={item.image}
//                             alt={item.item_name}
//                             className="w-8 h-8 object-contain"
//                           />
//                         ) : (
//                           <Package className="w-6 h-6 text-gray-400" />
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-medium text-sm truncate">{item.item_name}</h3>
//                         <p className="text-sm text-gray-500">${item.price_list_rate.toFixed(2)}</p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           className="h-8 w-8"
//                           onClick={() => updateQuantity(item.item_code, item.qty - 1)}
//                         >
//                           <Minus className="w-4 h-4" />
//                         </Button>
//                         <span className="w-8 text-center">{item.qty}</span>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           className="h-8 w-8"
//                           onClick={() => updateQuantity(item.item_code, item.qty + 1)}
//                         >
//                           <Plus className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
//                           onClick={() => removeFromCart(item.item_code)}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Action Buttons */}
//         <div className="p-4">
//           <Button
//             onClick={handlePayClick}
//             disabled={cart.length === 0}
//             className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
//           >
//             <Receipt className="w-5 h-5 mr-2" />
//             Pay
//           </Button>
//         </div>
//       </div>

//       {/* Pre-Payment Options Page */}
// <PrePaymentPage
//   isOpen={isPrePaymentOpen}
//   onClose={handlePrePaymentClose} // Close button triggers this
//   onSkip={handleSkip} // Skip button triggers this
//   onProceed={handleProceedToPayment} // Proceed button triggers this
//   total={total}
// />

//       {/* Payment Page */}
//       <PaymentPage
//         isOpen={isPaymentOpen}
//         onClose={() => setIsPaymentOpen(false)}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile"; // Import the usePOSProfile hook
import { PaymentPage } from "@/components/payment/PaymentPage";
import { PrePaymentPage } from "@/components/payment/PrePaymentPage";
import { ItemList } from "@/components/ItemList";
import { ItemSearch } from "@/components/ItemSearch";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Trash2,
  Receipt,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Grid,
} from "lucide-react";
import { getCategoryEmoji } from "../components/layout/categoryIcons";

interface ItemGroup {
  name: string;
  parent_item_group?: string;
}

interface GroupedCategories {
  [parent: string]: ItemGroup[];
}

export function VerticalPOSScreen() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    total,
    selectedCategory,
    setSelectedCategory,
  } = usePOSStore();

  const { showSubcategories } = usePOSProfile(); // Get the showSubcategories flag

  const [isPrePaymentOpen, setIsPrePaymentOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [categories, setCategories] = useState<GroupedCategories>({});
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Fetch item groups from Frappe API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "/api/method/frappe.client.get_list?doctype=Item Group&fields=[\"name\",\"parent_item_group\"]"
        );
        const result = await response.json();

        if (result.message) {
          // Group categories based on parent
          const grouped: GroupedCategories = {};
          result.message.forEach((category: ItemGroup) => {
            const parent = category.parent_item_group || "root";
            if (!grouped[parent]) grouped[parent] = [];
            grouped[parent].push(category);
          });

          // Remove the "root" parent if it doesn't exist in the data
          if (grouped["root"] && grouped["root"].length === 0) {
            delete grouped["root"];
          }

          setCategories(grouped);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle Pay button click
  const handlePayClick = () => {
    setIsPrePaymentOpen(true); // Open PrePaymentPage
  };

  // Handle PrePaymentPage close
  const handlePrePaymentClose = () => {
    setIsPrePaymentOpen(false); // Close PrePaymentPage
    setIsPaymentOpen(false); // Close PaymentPage
  };

  // Handle Proceed to Payment button click
  const handleProceedToPayment = () => {
    setIsPrePaymentOpen(false); // Close PrePaymentPage
    setIsPaymentOpen(true); // Open PaymentPage
  };

  // Handle Skip button click
  const handleSkip = () => {
    setIsPrePaymentOpen(false); // Close PrePaymentPage
    setIsPaymentOpen(true); // Open PaymentPage
  };

  // Handle parent category click
  const handleParentCategoryClick = (parent: string) => {
    if (expandedParent === parent) {
      setExpandedParent(null); // Collapse if already expanded
    } else {
      setExpandedParent(parent); // Expand the clicked parent category
    }
    setSelectedCategory(parent); // Set the selected category
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ItemSearch
              search={searchTerm}
              onSearch={(value) => setSearchTerm(value)}
              onClear={() => setSearchTerm("")}
            />
          </div>
        </div>

        {/* Parent Categories */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {/* "All Items" Button */}
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              className="flex-shrink-0 h-24 px-6 flex flex-col items-center gap-2 pt-3"
              onClick={() => {
                setSelectedCategory("");
                setExpandedParent(null);
              }}
            >
              <Grid className="w-6 h-6" />
              <span>All Items</span>
            </Button>

            {/* Parent Categories */}
            {Object.entries(categories).map(([parent, subCategories]) => {
              if (parent === "root") return null;

              return (
                <Button
                  key={parent}
                  variant={selectedCategory === parent ? "default" : "outline"} // Highlight if selected
                  className="flex-shrink-0 h-24 px-6 flex flex-col items-center gap-2 pt-3"
                  onClick={() => {
                    // Always set the selected category
                    setSelectedCategory(parent);

                    // Toggle expansion only if showSubcategories is true
                    if (showSubcategories) {
                      handleParentCategoryClick(parent);
                    } else {
                      // If subcategories are not allowed, collapse any expanded parent
                      setExpandedParent(null);
                    }
                  }}
                >
                  <span className="text-2xl">{getCategoryEmoji(parent)}</span>
                  <span>{parent}</span>
                  {/* Show chevron only if showSubcategories is true */}
                  {showSubcategories && (
                    expandedParent === parent ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Section */}
        {showSubcategories && expandedParent && ( // Only show subcategories if showSubcategories is true
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories[expandedParent].map((subCategory) => (
              <Button
                key={subCategory.name}
                variant={
                  selectedCategory === subCategory.name ? "default" : "outline"
                }
                className="flex-shrink-0 h-16 px-6 flex flex-col items-center gap-2"
                onClick={() => setSelectedCategory(subCategory.name)}
              >
                <span>{subCategory.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ItemList searchTerm={searchTerm} selectedCategory={selectedCategory} />
      </div>

      {/* Cart Section */}
      <div className="bg-white border-t border-gray-200">
        {/* Cart Header */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsCartExpanded(!isCartExpanded)}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Cart Items ({itemCount})</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
            {isCartExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Cart Items */}
        <AnimatePresence>
          {isCartExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="p-4 space-y-4 max-h-[40vh] overflow-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.item_code}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.item_name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.item_name}</h3>
                        <p className="text-sm text-gray-500">${item.price_list_rate.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.item_code, item.qty - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.item_code, item.qty + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.item_code)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="p-4">
          <Button
            onClick={handlePayClick}
            disabled={cart.length === 0}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Pay
          </Button>
        </div>
      </div>

      {/* Pre-Payment Options Page */}
      <PrePaymentPage
        isOpen={isPrePaymentOpen}
        onClose={handlePrePaymentClose}
        onSkip={handleSkip}
        onProceed={handleProceedToPayment}
        total={total}
      />

      {/* Payment Page */}
      <PaymentPage
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}