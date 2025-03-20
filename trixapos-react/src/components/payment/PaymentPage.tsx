import { X, Receipt, Check, CreditCard, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Calculator } from '../calculator/Calculator';
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePOSStore } from '@/hooks/Stores/usePOSStore';
import { Input } from '@/components/ui/input';
import { usePOSProfile } from '@/hooks/fetchers/usePOSProfile';

// Import components
import { PaymentMethods } from './PaymentMethods';
import { TransactionDetails } from './TransactionDetails';
import { NumberPad } from './NumberPad';
import { OrderSummary } from './OrderSummary';


//////>>cashmatic///////


import cashmatic from '@/assets/cashmatic-icon.png';
import { useCashmaticData } from '@/hooks/fetchers/cashmaticAPI';

// Define the CashmaticIcon component without JSX
const CashmaticIcon = () =>
  React.createElement('img', { src: cashmatic, alt: 'Cashmatic', className: 'rounded-md p-1 bg-white w-6 h-6 scale-[1]' });



// const handleLogin =  async () => {
//   try{
//     setLoginMessage('Logging In please wait');
//     const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username: "admin", password: "admin" }),
//     });
//     const loginData = await loginResponse.json();
//     if (loginData.code !== 0) {
//       throw new Error("Login failed: " + loginData.message);
//     }
//     setLoginMessage('Logged In');
//     const token = loginData.data.token;
//     setToken(token);
//     console.log("token: " + token);
//   }catch(error){
//     console.log(error);
//   }
// }


// const handleRefill = async () => {
//   console.log("refilling")
//   const refillResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartRefill`,
//   {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ reason: 'private reason' }),
//     }
//   )
  
// }

// const handleStopRefill = async () => {
//   console.log("refilling")
//   const response = await fetch(`${CASHMATIC_API_URL}/transaction/StopRefill`,
//   {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ reason: 'private reason' }),
//     }
//   )
  
// }

// const handlePayment = async () => {
//   try {
//     // const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
//     //   method: "POST",
//     //   headers: { "Content-Type": "application/json" },
//     //   body: JSON.stringify({ username: "cashmatic", password: "admin" }),
//     // });
//     // const loginData = await loginResponse.json();
//     // if (loginData.code !== 0) {
//     //   throw new Error("Login failed: " + loginData.message);
//     // }

//     // const token = loginData.data.token;
//     // setToken(token);
//     const paymentResponse = await fetch(
//       `${CASHMATIC_API_URL}/transaction/StartPayment`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ amount: itemPrice * 100, queueAllowed: true }),
//       }
//     );
//     const paymentData = await paymentResponse.json();
//     if (paymentData.code === 0) {
//       setMessage("Insert cash into Cashmatic.");
//     } else {
//       setMessage("Error: " + paymentData.message);
//     }
//     // await checkPaymentStatus(token);
//   } catch (error) {
//     setMessage(error.message);
//   }
// };

// const checkPaymentStatus = async (token) => {
//   try {
//     const statusResponse = await fetch(
//       `${CASHMATIC_API_URL}/device/LastTransaction`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     const statusData = await statusResponse.json();
//     if (statusData.code === 0) {
//       setReturnedAmount(statusData.data?.dispensed || 0);
//       return(statusData.data?.dispensed || 0);
//     }
//   } catch (error) {
//     console.error("Error fetching payment status:", error);
//   }
// };

// const handleCardClick = (price) => {
//   setItemPrice(price);
//   setIsModalOpen(true);
// };

// const handlePayed = async() => {
//   setIsModalOpen(false);
//   const response = await checkPaymentStatus(token);
//   let y = response / 100;
//   // setReturnedAmount(0);
//   setReturnedAmount(y);
  
// };




////////<<<<cashmatic/////

interface PaymentPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentPage({ isOpen, onClose }: PaymentPageProps) {


  const { canEditAdditionalDiscount, maxDiscountAllowed } = usePOSProfile();
  console.log(`🛠️ PaymentPage Loaded - Can Edit Additional Discount: ${canEditAdditionalDiscount}`);

  const { 
    cart, 
    total: cartTotal, 
    orderDiscount: storeOrderDiscount, 
    setOrderDiscount,
    customer, // Added customer from the store
    isVerticalLayout // Get isVerticalLayout from the store
  } = usePOSStore();

  const { payments, defaultPaymentMethod } = usePOSProfile();
const [selectedMethod, setSelectedMethod] = useState<string>(defaultPaymentMethod || "cash");

useEffect(() => {
  if (defaultPaymentMethod) {
    setSelectedMethod(defaultPaymentMethod);
  }
}, [defaultPaymentMethod]);


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
  
    if (value > maxDiscountAllowed) {
      toast.error(`❌ Error: Discount cannot exceed ${maxDiscountAllowed}%.`); // ✅ Show toast
      setOrderDiscountPercentage(0); // ✅ Reset discount
      return;
    }
  
    setOrderDiscountPercentage(value);
    setOrderDiscount(value);
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


  ////////>>>>cashmatic/////
  const [cashmaticMessage, setCashmaticMessage] = useState(''); // Main status message
  const [cashmaticPayMessage, setCashmaticPayMessage] = useState('');
  const [returnedAmount, setReturnedAmount] = useState(0); // Kept as per request ✅
  const [insertedAmount, setInsertedAmount] = useState(0); // Tracks how much is inserted
  const [requestedAmount, setRequestedAmount] = useState(0); // Tracks requested amount
  const [payStatus, setPayStatus] = useState('pending'); // Tracks payment status
  const [cashmaticProgress, setCashmaticProgress] = useState(10); // UI progress tracking
  const [token, setToken] = useState(null);
  const [refId, setRefId] = useState(null);
  const [cashmaticDialogOpen, setCashmaticDialogOpen] = useState(false);
  
  // const { cashmaticData, hasData, isLoading, error } = useCashmaticData();
  // const CASHMATIC_API_URL = `http://${cashmaticData.ip}:${cashmaticData.port}/api`;
  const CASHMATIC_API_URL = `http://192.168.0.147/api`;
  

const payWithCashmatic = async () => {
    // console.log(`🆔 Generated Reference ID: ${referenceId}`);
    setCashmaticMessage('🔄 Logging into Cashmatic...');
    setPayStatus('idle');
  
    try {
      setPayStatus("logging In");
      // Step 1: Login
      const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin" }),
      });

      const loginData = await loginResponse.json();
      if (loginData.code !== 0) {
        throw new Error("Login failed: " + loginData.message);
      }
      
      setPayStatus('✅ Logged In');
      setCashmaticProgress(30);
      const authToken = loginData.data.token;
      setToken(authToken);

      // Step 2: Start Payment
      const paymentResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          amount: cartTotal * 100,
          queueAllowed: true,
          // reference: referenceId, // UNIQUE TRANSACTION IDENTIFIER
        }),
      });

      const paymentData = await paymentResponse.json();
      if (paymentData.code === 0) {
        setCashmaticMessage(`💰 Insert cash into Cashmatic.`);
        return { authToken }; // Return reference ID & token for tracking
      } else {
        setCashmaticMessage("❌ Error: " + paymentData.message);
        return null;
      }

    } catch (error) {
      setCashmaticMessage(`❌ ${error.message}`);
      return null;
    }
};

// ✅ **Track Active Transaction Progress**
const trackActiveTransaction = async (authToken: string) => {
  let maxAttempts = 100;
  let attempt = 0;
  let completed = false;
  let previousDispensed = 0; // Track previous dispensed amount

  while (attempt < maxAttempts && !completed && payStatus !== "Cancelled") {
    try {
      const response = await fetch(`${CASHMATIC_API_URL}/device/ActiveTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (data.code === 0) {
        const { id, requested, inserted, dispensed, operation, end } = data.data;

        // Ensure Progress Bar Updates
        if (requested > 0) {
          const progressValue = Math.min((inserted / requested) * 100, 100);
          setCashmaticProgress(progressValue);
        }

        // Update Inserted & Requested Amounts
        setCashmaticMessage(`⏳ Insert cash: ${(inserted / 100).toFixed(2)} / ${(requested / 100).toFixed(2)}`);
        setInsertedAmount(inserted);
        setRequestedAmount(requested);
        setReturnedAmount(dispensed / 100);

        // Detect Payment Completion or Cancellation
        // if(insertedAmount >= requestedAmount) {
        //     setPayStatus("Returning the Change - Dispensing");
        //     setCashmaticMessage("Returning the Change, please wait...")
        // }
        if (dispensed > previousDispensed) {
          setCashmaticMessage(`💰 Returning change... Dispensed: €${(dispensed / 100).toFixed(2)}`);
        }
        previousDispensed = dispensed;
        if (operation === "idle") {
          completed = true;

          // Fetch Last Transaction for Final Amount
          const lastTransactionResponse = await fetch(`${CASHMATIC_API_URL}/device/LastTransaction`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          const lastData = await lastTransactionResponse.json();
          if (lastData.code === 0) {
            const { dispensed, end } = lastData.data;
            const finalReturned = dispensed / 100;

            if (end === "canceled") {
              setPayStatus("Cancelled");
              setCashmaticMessage(`❌ Payment Cancelled. Returned: $${finalReturned.toFixed(2)}`);
              setCashmaticProgress(5);
              setReturnedAmount(finalReturned); // ✅ Keep the correct returned amount
            } else {
              setPayStatus("Completed");
              setCashmaticMessage(`✅ Payment Completed. Change: $${finalReturned.toFixed(2)}`);
              setCashmaticProgress(100);
              setReturnedAmount(finalReturned); // ✅ Store the correct value
            }
          }
        }
      } else {
        setCashmaticMessage(`⚠️ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error tracking payment:", error);
      setCashmaticMessage("❌ Error connecting to Cashmatic.");
    }

    if (!completed && payStatus !== "Cancelled") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempt++;
    } else {
      break;
    }
  }
};






// ✅ **Handle the Payment Process**
const handlePayment = async () => {
    setCashmaticDialogOpen(true);
    // setCashmaticMessage("🔄 Starting Cashmatic Payment...");

    const paymentDetails = await payWithCashmatic();
    if (!paymentDetails) return;
    console.log("logged In");

    const {  authToken } = paymentDetails;

    // setCashmaticMessage("💰 Please insert cash into Cashmatic...");
    const dispensedAmount = await trackActiveTransaction(authToken);
    setCashmaticMessage(prevMessage => prevMessage + " Returned Amount: " + dispensedAmount);
    // setCashmaticProgress(100);
    // if (dispensedAmount !== null) {
    //     setCashmaticMessage(`✅ Payment Completed! Change dispensed: $${dispensedAmount.toFixed(2)}`);
    // } else {
    //     setCashmaticMessage("❌ Error: Unable to fetch payment status.");
    // }
};


const cancelPayment = async () => {
  if (!token) {
    setCashmaticMessage("⚠️ No active transaction to cancel.");
    return;
  }

  if(payStatus.includes('Dispensing'))
    return;

  try {
    setCashmaticMessage("⏳ Cancelling Payment...");
    setPayStatus("Cancelling...");

    const response = await fetch(`${CASHMATIC_API_URL}/transaction/CancelPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.code === 0) {
      setPayStatus("Cancelled");
      setCashmaticMessage("❌ Payment Cancelled.");
      setCashmaticProgress(5);
      setInsertedAmount(0);
      setRequestedAmount(0);
      // ❌ Do NOT reset `returnedAmount`—we need to show the returned cash
    } else {
      setCashmaticMessage(`⚠️ Error Cancelling: ${data.message}`);
    }
  } catch (error) {
    console.error("❌ Error cancelling payment:", error);
    setCashmaticMessage("❌ Error connecting to Cashmatic.");
  }
};



  
  ////////<<<<cashmatic/////

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl p-0 bg-gray-100 flex flex-col mx-auto h-auto overflow-auto">
        {/* Add proper DialogHeader and DialogTitle for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>
        
        {/* Enhanced Header with 3-part layout */}
        <div className="bg-white px-4 py-3 border-b sticky top-0 z-10 flex items-center">
          {/* Left: Customer info */}
          <div className="w-1/3 flex items-center">
            {customer?.customer_name && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Customer:</span>
                <span className="ml-2 font-medium text-gray-800 truncate max-w-xs">
                  {customer.customer_name}
                </span>
              </div>
            )}
          </div>
          
          {/* Center: Payment title */}
          <div className="w-1/3 flex justify-center">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
          </div>
          
          {/* Right: Close button */}
          <div className="w-1/3 flex justify-end">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

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
  paymentMethods={payments} 
/>

              
              {/* Order Discount Input - Hidden in Vertical Layout */}
              {!isVerticalLayout && (
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Discount (%) (Max: {maxDiscountAllowed}%)
                  </label>
                  <Input
                    type="number"
                    value={orderDiscountPercentage}
                    onChange={handleOrderDiscountChange}
                    className={`w-full p-2 mt-1 text-lg border rounded-lg ${!canEditAdditionalDiscount ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    placeholder={`Enter discount (Max: ${maxDiscountAllowed}%)`}
                    min="0"
                    max={maxDiscountAllowed} // ✅ Restrict max input
                    readOnly={!canEditAdditionalDiscount}
                  />
                </div>
              )}

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
          {selectedMethod !== 'cashmatic' ? (
            <Button
              onClick={() => setPaymentComplete(true)}
              className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              disabled={(selectedMethod != 'cashmatic') && amountPaidNum < totalAfterAllDiscounts || paymentComplete}
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
            )
          :
          (
            <Button
              onClick={handlePayment}
              className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              disabled={(selectedMethod != 'cashmatic') && amountPaidNum < totalAfterAllDiscounts || paymentComplete}
            >
            <div className="flex items-center justify-center gap-2">
              <CashmaticIcon />
              Pay with Cashmatic
            </div>
            </Button>
            )}
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
      <CashmaticPaymentDialog 
        isOpen={cashmaticDialogOpen} 
        status={cashmaticMessage} 
        message1={cashmaticPayMessage} 
        onClose={() => {
          setCashmaticDialogOpen(false);
          onClose()
        }
        }
        returnedAmount={returnedAmount}
        progress={cashmaticProgress}
        inserted={insertedAmount}
        requested={requestedAmount}
        cancelPayment={cancelPayment}
      />
    </Dialog>
  );
}


// import { Loader, CheckCircle, AlertCircle } from "lucide-react";

// const CashmaticPaymentDialog = ({ isOpen, status, message, onClose }) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold text-gray-900">
//             Cashmatic Payment Process
//           </DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col items-center text-center mt-4">
//           {/* Dynamic Message Display */}
//           {status.includes("Logging") && <Loader className="w-12 h-12 text-blue-500 animate-spin" />}
//           {status.includes("Completed") && <CheckCircle className="w-12 h-12 text-green-500" />}
//           {message.includes("Error") && <AlertCircle className="w-12 h-12 text-red-500" />}

//           <p className="mt-4 text-gray-700 text-lg">{'Status: ' + status}</p>
//           <p className="mt-4 text-gray-700 text-lg">{message}</p>
//           {/* <p className="mt-4 text-gray-700 text-lg">{message}</p> */}
//         </div>

//         <button 
//           onClick={onClose}
//           className="mt-6 w-full py-2 text-white bg-gray-700 hover:bg-gray-800 rounded-lg text-lg font-medium transition"
//         >
//           Close
//         </button>
//       </DialogContent>
//     </Dialog>
//   );
// };
import { Loader, CheckCircle, AlertCircle, Clock } from "lucide-react";

const CashmaticPaymentDialog = ({ isOpen, status, message1, progress, inserted, requested, returnedAmount, onClose, cancelPayment }) => {
  
  const [message, setMessage] = useState(message1);

  useEffect(() => {
    let timer;
    if (isOpen && status.includes("Completed")) {
      timer = setTimeout(() => {
        onClose(); // Auto-close dialog
      }, 10000); // 10 seconds
    }
    
    return () => clearTimeout(timer); // Cleanup if the component unmounts or user closes manually
  }, [isOpen, status, onClose]);

  status.includes("Cancelled") && (setMessage("Payment Cancelled"));
  if(status.includes("Dispensing"))
    setMessage("Returning the change, please wait...");

  return (
    // <Dialog open={isOpen} onOpenChange={(!status.includes("Cancelled") && !status.includes("Completed")) ? cancelPayment : onClose}>
    <Dialog open={isOpen} modal onOpenChange={() => {}}>
       <DialogContent showCloseButton={false} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            💵 Cashmatic Payment Process
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center mt-4 space-y-3">
          {/* Dynamic Status Icon */}
          {status.includes("Logging") && <Loader className="w-12 h-12 text-blue-500 animate-spin" />}
          {(status.includes("Processing") || status.includes("Dispensing")) && <Clock className="w-12 h-12 text-yellow-500 animate-pulse" />}
          {status.includes("Completed") && <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />}
          {status.includes("Cancelled") && <XCircle className="w-12 h-12 text-red-500 animate-pulse" />}
          {message.includes("Error") && <AlertCircle className="w-12 h-12 text-red-500" />}

          {/* Status Messages */}
          <p className="mt-2 text-gray-800 text-lg font-semibold">{message}</p>

          {/* Display Inserted Amount OR Returned Amount */}
          {inserted !== null && requested !== null && !status.includes("Cancelled") && (
            progress === 100 ? (
              <p className="text-gray-600 text-md">
                <strong>Returned:</strong> ${returnedAmount.toFixed(2)}
              </p>
            ) : (
              <p className="text-gray-600 text-md">
                <strong>Inserted:</strong> ${(inserted / 100).toFixed(2)} / ${(requested / 100).toFixed(2)}
              </p>
            )
          )}

          {/* Progress Bar */}
          {!status.includes("Cancelled") && 
          <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                progress < 50 ? "bg-yellow-500" : progress < 90 ? "bg-blue-500" : "bg-green-500"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          }
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          {/* Cancel Payment Button */}
          {!status.includes("Cancelled") && !status.includes("Completed") && !status.includes("Dispensing") && (
            <button 
              onClick={cancelPayment}
              className="flex-1 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-lg font-medium transition"
            >
              Cancel Payment
            </button>
          )}

          {/* Close Dialog Button */}
          {(status.includes("Cancelled") || status.includes("Completed")) && (
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-white bg-gray-700 hover:bg-gray-800 rounded-lg text-lg font-medium transition"
          >
            Close
          </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashmaticPaymentDialog;

