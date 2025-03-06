// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { usePOSStore } from '@/hooks/Stores/usePOSStore';
// import { Calculator } from '../calculator/Calculator';
// import { 
//   CreditCard, 
//   Wallet, 
//   Banknote, 
//   Smartphone, 
//   Receipt, 
//   X,
//   ArrowLeft,
//   Check
// } from 'lucide-react';
// interface PaymentPageProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// type PaymentMethod = {
//   id: string;
//   name: string;
//   icon: React.ReactNode;
//   color: string;
// };

// const PAYMENT_METHODS: PaymentMethod[] = [
//   { 
//     id: 'cash', 
//     name: 'Cash', 
//     icon: <Banknote className="w-6 h-6" />,
//     color: 'bg-emerald-500'
//   },
//   { 
//     id: 'card', 
//     name: 'Card', 
//     icon: <CreditCard className="w-6 h-6" />,
//     color: 'bg-blue-500'
//   },
//   { 
//     id: 'wallet', 
//     name: 'E-Wallet', 
//     icon: <Wallet className="w-6 h-6" />,
//     color: 'bg-purple-500'
//   },
//   { 
//     id: 'mobile', 
//     name: 'Mobile Pay', 
//     icon: <Smartphone className="w-6 h-6" />,
//     color: 'bg-orange-500'
//   },
// ];

// export function PaymentPage({ isOpen, onClose }: PaymentPageProps) {
//   const { cart, total: cartTotal } = usePOSStore();
//   const [selectedMethod, setSelectedMethod] = useState<string>('cash');
//   const [additionalDiscount, setAdditionalDiscount] = useState(0);
//   const [amountPaid, setAmountPaid] = useState('');
//   const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
//   const [showSummary, setShowSummary] = useState(false);
//   const [paymentComplete, setPaymentComplete] = useState(false);
//   const [screenSize, setScreenSize] = useState('md');

//   // Detect screen size and handle zoom levels
//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth;
//       if (width < 640) {
//         setScreenSize('sm');
//       } else if (width < 1024) {
//         setScreenSize('md');
//       } else {
//         setScreenSize('lg');
//       }
//     };

//     handleResize(); // Initial check
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Calculate totals
//   const itemDiscounts = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
//   const total = cartTotal || 0; // Ensure it's not undefined
//   const amountPaidNum = parseFloat(amountPaid) || 0;
//   const change = Math.max(0, amountPaidNum - total);
//   const remaining = Math.max(0, total - amountPaidNum);

//   // Reset paid amount when dialog opens
//   useEffect(() => {
//     if (isOpen) {
//       setAmountPaid('');
//       setPaymentComplete(false);
//       setShowSummary(false);
//     }
//   }, [isOpen]);

//   const handleNumberInput = (value: string) => {
//     if (value === 'backspace') {
//       setAmountPaid(prev => prev.slice(0, -1));
//       return;
//     }

//     if (value === 'clear') {
//       setAmountPaid('');
//       return;
//     }

//     if (value === '.') {
//       if (amountPaid.includes('.')) return;
//       setAmountPaid(prev => prev + '.');
//       return;
//     }

//     setAmountPaid(prev => {
//       const newValue = prev + value;
//       const numValue = parseFloat(newValue);
//       return numValue > 999999.99 ? prev : newValue;
//     });
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount);
//   };

//   const handleCompletePayment = () => {
//     setPaymentComplete(true);
//     // Add a timer to auto-close or show success state
//     setTimeout(() => {
//       onClose();
//     }, 2000);
//   };

//   // Handle exact and round up payment
//   const handleExactPayment = () => {
//     setAmountPaid(total.toString());
//   };

//   const handleRoundUpPayment = () => {
//     // Round up to the nearest dollar
//     const roundedUp = Math.ceil(total);
//     setAmountPaid(roundedUp.toString());
//   };

//   // Different layouts based on screen size
//   const renderPaymentPanel = () => {
//     // Shared component for transaction details
//     const TransactionDetails = () => (
//       <div className={`bg-white rounded-xl shadow-sm p-3 transition-all duration-300 ${paymentComplete ? 'bg-green-50 border border-green-200' : ''}`}>
//         <div className="text-center">
//           {paymentComplete ? (
//             <div className="flex flex-col items-center">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
//                 <Check className="w-5 h-5 text-green-600" />
//               </div>
//               <div className="text-lg font-bold text-green-700 mb-1">Payment Complete</div>
//               <div className="text-sm text-green-600">Thank you for your purchase</div>
//             </div>
//           ) : (
//             <>
//               <div className="text-sm font-medium text-gray-500 mb-1">Amount Due</div>
//               <div className="text-2xl font-bold text-gray-900 mb-2">
//                 {formatCurrency(total)}
//               </div>
//               <div className="flex items-center justify-center gap-2 text-xs">
//                 <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
//                   {cart.length} items
//                 </span>
//                 {itemDiscounts > 0 && (
//                   <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">
//                     {formatCurrency(itemDiscounts)} saved
//                   </span>
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         {!paymentComplete && (
//           <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-center">
//             <div>
//               <div className="text-xs font-medium text-gray-500 mb-1">Amount Paid</div>
//               <div className="text-lg font-bold text-gray-900">
//                 {amountPaid ? formatCurrency(parseFloat(amountPaid)) : '$0.00'}
//               </div>
//             </div>
//             <div>
//               <div className="text-xs font-medium text-gray-500 mb-1">
//                 {change > 0 ? 'Change' : 'Remaining'}
//               </div>
//               <div className={`text-lg font-bold ${change > 0 ? 'text-green-600' : 'text-blue-600'}`}>
//                 {formatCurrency(change > 0 ? change : remaining)}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );

//     // Shared component for payment methods
//     const PaymentMethods = () => (
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
//         {PAYMENT_METHODS.map((method) => (
//           <button
//             key={method.id}
//             onClick={() => setSelectedMethod(method.id)}
//             className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
//               selectedMethod === method.id
//                 ? 'bg-gray-900 text-white border-gray-700 shadow-md'
//                 : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
//             }`}
//           >
//             <div className={`p-1 rounded-lg ${selectedMethod === method.id ? method.color : 'bg-gray-100'}`}>
//               {React.cloneElement(method.icon as React.ReactElement, {
//                 className: `w-5 h-5 ${selectedMethod === method.id ? 'text-white' : 'text-gray-600'}`
//               })}
//             </div>
//             <span className="text-xs font-medium">{method.name}</span>
//             {selectedMethod === method.id && (
//               <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                 <Check className="w-3 h-3 text-white" />
//               </div>
//             )}
//           </button>
//         ))}
//       </div>
//     );

//     // Shared component for number pad
//     const NumberPad = () => (
//       <div className="grid grid-cols-4 gap-2">
//         {/* Quick action buttons in one row */}
//         <div className="col-span-4 grid grid-cols-3 gap-2 mb-2">
//           <button
//             onClick={handleExactPayment}
//             className="p-2 text-m font-medium rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
//           >
//             Exact
//           </button>
//           <button
//             onClick={handleRoundUpPayment}
//             className="p-2 text-m font-medium rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
//           >
//             Round Up
//           </button>
//           <button
//             onClick={() => setIsCalculatorOpen(true)}
//             className="p-2 text-m font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors"
//           >
//             Calculator
//           </button>
//         </div>

//         {/* Numbers with smaller size */}
//         <div className="col-span-3 grid grid-cols-3 gap-2">
//           {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
//             <button
//               key={num}
//               onClick={() => handleNumberInput(num.toString())}
//               className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors flex items-center justify-center"
//             >
//               {num}
//             </button>
//           ))}
//         </div>

//         {/* Control buttons */}
//         <div className="col-span-1 grid grid-cols-1 gap-2">
//           <button
//             onClick={() => handleNumberInput('backspace')}
//             className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
//           >
//             ←
//           </button>
//           <button
//             onClick={() => handleNumberInput('clear')}
//             className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
//           >
//             C
//           </button>
//           <button
//             onClick={() => handleNumberInput('.')}
//             className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors flex items-center justify-center"
//           >
//             .
//           </button>
//         </div>

//         {/* Zero button */}
//         <button
//           onClick={() => handleNumberInput('0')}
//           className="col-span-3 p-2 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors"
//         >
//           0
//         </button>
//       </div>
//     );

//     // Small screen layout - stacked
//     if (screenSize === 'sm') {
//       return (
//         <div className="flex flex-col gap-4">
//           <TransactionDetails />
//           <PaymentMethods />
//           <NumberPad />
//         </div>
//       );
//     }
    
//     // Medium and large screen layout - side-by-side
//     return (
//       <div className="grid grid-cols-12 gap-4">
//         {/* Left panel - transaction details and payment methods - INCREASED WIDTH */}
//         <div className="col-span-5 flex flex-col gap-4">
//           <TransactionDetails />
//           <PaymentMethods />
          
//           {/* Order summary button - only shown on medium/large screens */}
//           <button
//             onClick={() => setShowSummary(true)}
//             className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors mt-auto"
//           >
//             <Receipt className="w-5 h-5 text-gray-600" />
//             <span className="text-m font-medium">Order Summary</span>
//           </button>
//         </div>
        
//         {/* Right panel - number pad */}
//         <div className="col-span-7">
//           <NumberPad />
//         </div>
//       </div>
//     );
//   };

//   // Determine dynamic classes for responsive dialog
//   const getDialogSizeClass = () => {
//     switch (screenSize) {
//       case 'sm':
//         return 'max-w-lg';
//       case 'md':
//         return 'max-w-3xl';
//       case 'lg':
//         return 'max-w-5xl';
//       default:
//         return 'max-w-3xl';
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className={`w-full ${getDialogSizeClass()} p-0 bg-gray-100 flex flex-col mx-auto h-auto overflow-auto`}>
//         <DialogHeader className="bg-white px-4 py-3 flex items-center border-b sticky top-0 z-10 relative">
//           <div className="flex items-center gap-3">
//             {screenSize === 'sm' && (
//               <button
//                 onClick={() => setShowSummary(true)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
//               >
//                 <Receipt className="w-5 h-5 text-gray-600" />
//                 <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-xs">
//                   {cart.length}
//                 </span>
//               </button>
//             )}
//             <DialogTitle className="text-lg font-semibold text-gray-900">Payment</DialogTitle>
//           </div>

//           {/* Close Button */}
//           <button
//             onClick={onClose}
//             className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-600" />
//           </button>
//         </DialogHeader>

//         <div className="p-4 overflow-y-auto flex-1">
//           {renderPaymentPanel()}

//           {/* Action Button */}
//           <div className="mt-4">
//             <Button
//               onClick={handleCompletePayment}
//               className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
//               disabled={amountPaidNum < total || paymentComplete}
//             >
//               {paymentComplete ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <Check className="w-5 h-5" />
//                   Payment Complete
//                 </div>
//               ) : (
//                 "Complete Payment"
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Order Summary Drawer */}
//         {showSummary && (
//           <div className="absolute inset-0 bg-white flex flex-col z-20 overflow-hidden">
//             <DialogHeader className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white z-10">
//               <button
//                 onClick={() => setShowSummary(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <DialogTitle className="text-base font-medium">Order Summary</DialogTitle>
//             </DialogHeader>
            
//             <div className="p-4 flex flex-col overflow-y-auto flex-1">
//               <div className="space-y-2 mb-4">
//                 {cart.map((item) => (
//                   <div key={item.item_code} className="flex justify-between items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
//                     <div className="flex-1">
//                       <div className="font-medium text-sm">{item.item_name}</div>
//                       <div className="text-xs text-gray-500">
//                         {item.qty} × {formatCurrency(item.price_list_rate)}
//                       </div>
//                       {item.discount > 0 && (
//                         <div className="text-xs text-green-600">
//                           Discount: {formatCurrency(item.discount)}
//                         </div>
//                       )}
//                     </div>
//                     <div className="font-medium text-sm text-right">
//                       {formatCurrency(item.price_list_rate * item.qty - (item.discount || 0))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               {/* Summary totals */}
//               <div className="border-t pt-3 space-y-2 mt-auto">
//                 <div className="flex justify-between text-xs">
//                   <span className="text-gray-600">Subtotal:</span>
//                   <span>{formatCurrency(cartTotal)}</span>
//                 </div>
//                 {itemDiscounts > 0 && (
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-600">Discounts:</span>
//                     <span className="text-green-600">-{formatCurrency(itemDiscounts)}</span>
//                   </div>
//                 )}
//                 {additionalDiscount > 0 && (
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-600">Additional Discount:</span>
//                     <span className="text-green-600">-{formatCurrency(additionalDiscount)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between font-semibold text-base pt-2 border-t">
//                   <span>Total:</span>
//                   <span>{formatCurrency(total)}</span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Footer with action button */}
//             <div className="p-4 border-t mt-auto">
//               <Button 
//                 onClick={() => setShowSummary(false)}
//                 className="w-full"
//               >
//                 Back to Payment
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>

//       {/* Calculator */}
//       <Calculator
//         isOpen={isCalculatorOpen}
//         onClose={() => setIsCalculatorOpen(false)}
//         onResult={(result) => {
//           setAmountPaid(result.toString());
//           setIsCalculatorOpen(false);
//         }}
//       />
//     </Dialog>
//   );
// }



import { X, Receipt, Check } from 'lucide-react';
import { Calculator } from '../calculator/Calculator';
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePOSStore } from '@/hooks/Stores/usePOSStore';
import { Input } from '@/components/ui/input';

// Import components
import { PaymentMethods } from './PaymentMethods';
import { TransactionDetails } from './TransactionDetails';
import { NumberPad } from './NumberPad';
import { OrderSummary } from './OrderSummary';

interface PaymentPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentPage({ isOpen, onClose }: PaymentPageProps) {
  const { cart, total: cartTotal, orderDiscount: storeOrderDiscount, setOrderDiscount } = usePOSStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [orderDiscountPercentage, setOrderDiscountPercentage] = useState(storeOrderDiscount || 0);
  const [amountPaid, setAmountPaid] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Ensure valid cart total
  const validCartTotal = cartTotal || 0;

  // Calculate item discount amount
  const itemDiscountAmount = cart.reduce(
    (sum, item) => sum + ((item.price_list_rate * item.qty) * (item.discount || 0)) / 100,
    0
  );
  
  // Calculate subtotal after item discounts
  const subtotalAfterItemDiscounts = cart.reduce(
    (sum, item) => sum + (item.price_list_rate * item.qty), 0
  ) - itemDiscountAmount;
  
  // Calculate order discount amount
  const orderDiscountAmount = (subtotalAfterItemDiscounts * orderDiscountPercentage) / 100;
  
  // Calculate final total
  const totalAfterAllDiscounts = subtotalAfterItemDiscounts - orderDiscountAmount;

  const handleNumberInput = useCallback((value: string) => {
    setAmountPaid(prevAmount => {
      // Handle backspace
      if (value === 'backspace') {
        return prevAmount.slice(0, -1);
      }

      // Handle clear
      if (value === 'clear') {
        return '';
      }

      // Handle decimal point
      if (value === '.') {
        // Prevent multiple decimal points
        if (prevAmount.includes('.')) return prevAmount;
        return prevAmount + (prevAmount === '' ? '0.' : '.');
      }

      // Handle number input
      const newAmount = prevAmount + value;
      
      // Validate input
      // Prevent leading zeros, limit to two decimal places
      const formattedAmount = newAmount.replace(/^0+(?=\d)/, '');
      const decimalParts = formattedAmount.split('.');
      
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        return parseFloat(formattedAmount).toFixed(2);
      }

      return formattedAmount;
    });
  }, []);

  const handleExactPayment = () => {
    setAmountPaid(totalAfterAllDiscounts.toFixed(2));
  };

  const handleRoundUpPayment = () => {
    setAmountPaid(Math.ceil(totalAfterAllDiscounts).toFixed(2));
  };

  const handleOrderDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const clampedValue = Math.min(100, Math.max(0, value));
    setOrderDiscountPercentage(clampedValue);
    // Update the store with the new value
    setOrderDiscount(clampedValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculation helpers
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = Math.max(0, amountPaidNum - totalAfterAllDiscounts);
  const remaining = Math.max(0, totalAfterAllDiscounts - amountPaidNum);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
      setPaymentComplete(false);
      setShowSummary(false);
      setIsCalculatorOpen(false);
      // Initialize order discount from store
      setOrderDiscountPercentage(storeOrderDiscount || 0);
    }
  }, [isOpen, storeOrderDiscount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl p-0 bg-gray-100 flex flex-col mx-auto h-auto overflow-auto">
        <DialogHeader className="bg-white px-4 py-3 flex items-center border-b sticky top-0 z-10 relative">
          <DialogTitle className="text-lg font-semibold text-gray-900">Payment</DialogTitle>
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </DialogHeader>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Side */}
            <div className="col-span-5 flex flex-col gap-4">
              <TransactionDetails
                total={totalAfterAllDiscounts}
                cart={cart}
                amountPaid={amountPaid}
                itemDiscounts={itemDiscountAmount}
                orderDiscount={orderDiscountPercentage}
                orderDiscountAmount={orderDiscountAmount}
                paymentComplete={paymentComplete}
                formatCurrency={formatCurrency}
                change={change}
                remaining={remaining}
              />

              <PaymentMethods 
                selectedMethod={selectedMethod} 
                onSelectMethod={setSelectedMethod} 
              />

              {/* Order Discount Input */}
              <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700">Order Discount (%)</label>
                <Input
                  type="number"
                  value={orderDiscountPercentage}
                  onChange={handleOrderDiscountChange}
                  className="w-full p-2 mt-1 text-lg border rounded-lg"
                  placeholder="Enter discount %"
                  min="0"
                  max="100"
                />
              </div>

              <button
                onClick={() => setShowSummary(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors mt-auto"
              >
                <Receipt className="w-5 h-5 text-gray-600" />
                <span className="text-m font-medium">Order Summary</span>
              </button>
            </div>

            {/* Right Side */}
            <div className="col-span-7">
              <NumberPad
                onNumberInput={handleNumberInput}
                onExactPayment={handleExactPayment}
                onRoundUpPayment={handleRoundUpPayment}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
                totalAmount={totalAfterAllDiscounts}
              />
            </div>
          </div>

          {/* Complete Payment Button */}
          <div className="mt-4">
            <Button
              onClick={() => setPaymentComplete(true)}
              className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              disabled={amountPaidNum < totalAfterAllDiscounts || paymentComplete}
            >
              {paymentComplete ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Payment Complete
                </div>
              ) : (
                'Complete Payment'
              )}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        {showSummary && (
          <OrderSummary
            cart={cart}
            cartTotal={validCartTotal}
            orderDiscountPercentage={orderDiscountPercentage}
            orderDiscountAmount={orderDiscountAmount}
            itemDiscounts={itemDiscountAmount}
            totalAfterDiscount={totalAfterAllDiscounts}
            formatCurrency={formatCurrency}
            onClose={() => setShowSummary(false)}
          />
        )}
      </DialogContent>

      {/* Calculator */}
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onResult={(result) => {
          setAmountPaid(result.toString());
          setIsCalculatorOpen(false);
        }}
      />
    </Dialog>
  );
}