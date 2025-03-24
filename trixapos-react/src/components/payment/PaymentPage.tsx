import { X, Receipt, Check, CreditCard, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Calculator } from '../calculator/Calculator';
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice, usePOSStore } from '@/hooks/Stores/usePOSStore';
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
  const [cashmaticMessage, setCashmaticMessage] = useState('pending'); // Main status message
  const [cashmaticPayMessage, setCashmaticPayMessage] = useState('');
  const [returnedAmount, setReturnedAmount] = useState(0); // Kept as per request ✅
  const [insertedAmount, setInsertedAmount] = useState(0); // Tracks how much is inserted
  const [requestedAmount, setRequestedAmount] = useState(0); // Tracks requested amount
  const [payStatus, setPayStatus] = useState('pending'); // Tracks payment status
  const [cashmaticProgress, setCashmaticProgress] = useState(10); // UI progress tracking
  const [token, setToken] = useState(null);
  const [refId, setRefId] = useState(null);
  const [cashmaticDialogOpen, setCashmaticDialogOpen] = useState(false);
  
  const { cashmaticData, hasData, isLoading, error } = useCashmaticData();
  const CASHMATIC_API_URL = `http://${cashmaticData.ip}:${cashmaticData.port}/api`;
  // const CASHMATIC_API_URL = `http://192.168.0.147/api`;
  

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
        body: JSON.stringify({ username: cashmaticData.username, password: cashmaticData.password }),
      });

      const loginData = await loginResponse.json();
      if (loginData.code !== 0) {
        setPayStatus("Login failed");
        setCashmaticMessage('Login failed, please try again');
        throw new Error("Login failed: " + loginData.message);
      }
      
      setPayStatus('✅ Logged In');
      setCashmaticMessage('✅ Logged In successfully');
      setCashmaticProgress(30);
      const authToken = loginData.data.token;
      setToken(authToken);

      // Step 2: Start Payment
      // const paymentResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartPayment`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${authToken}`,
      //   },
      //   body: JSON.stringify({ 
      //     amount: cartTotal * 100,
      //     queueAllowed: true,
      //   }),
      // });

      // const paymentData = await paymentResponse.json();

      // Step 2: Start Refill (other solution)

      const check = await checkChangeBeforePayment(cartTotal, authToken);
      if(check){

      const refillResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartDeposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          amount: cartTotal * 100,
          // queueAllowed: true,
        }),
      });

      const refillData = await refillResponse.json();

      // to add a function that tests if there is enough change to continue with payment process
      
      if (refillData.code === 0) {
        setCashmaticMessage(`💰 Insert cash into Cashmatic.`);
        return { authToken }; // Return reference ID & token for tracking
      } else {
        setCashmaticMessage("❌ Error: " + refillData.message);
        return null;
      }
    }else{
      setPayStatus("Cancelled");
      setCashmaticMessage("❌ Machine cannot provide change right now.");
    }

    } catch (error) {
      setCashmaticMessage(`❌ ${error.message}`);
      return null;
    }
};

// ✅ **Track Active Transaction Progress**
const trackActiveTransaction = async (authToken: string) => {
  let maxAttempts = 150; // Increased attempts to ensure full monitoring
  let attempt = 0;
  let completed = false;
  let previousDispensed = 0;
  setReturnedAmount(0);

  while ((attempt < maxAttempts) && !completed && (payStatus !== "Cancelled") && (payStatus !== "Completed")) {
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
        const { inserted, dispensed, notDispensed, operation } = data.data;

        if (payStatus === "Cancelled") break;
        setInsertedAmount(inserted);
        setRequestedAmount(cartTotal * 100);
        setReturnedAmount(dispensed / 100); // ✅ Update returned amount each time

        // If not all change has been dispensed, continue tracking
        if ((operation == "withdrawal")) {
          setPayStatus("Dispensing");
          // setCashmaticMessage(`💵 Dispensing change... Remaining: €${(notDispensed / 100).toFixed(2)}`);
        }

        // Ensure progress bar updates correctly
        if ((cartTotal * 100) > 0) {
          const progressValue = Math.min((inserted / (cartTotal * 100)) * 100, 100);
          setCashmaticProgress(progressValue);
        }

        // If the full amount has been inserted, stop deposit
        if ((inserted / 100).toFixed(2) >= (cartTotal).toFixed(2)) {
          setPayStatus("Processing");
          setCashmaticMessage("💳 Processing payment, please wait...");

          const stopRefill = await fetch(`${CASHMATIC_API_URL}/transaction/StopDeposit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          const stopRefillData = await stopRefill.json();
          if (stopRefillData.code === 0) {
            setPayStatus("Verifying Change");
            setCashmaticMessage("🔄 Checking if exact change is available...");

            const lastTransactionResponse = await fetch(`${CASHMATIC_API_URL}/device/LastTransaction`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            });

            const lastData = await lastTransactionResponse.json();
            if ((lastData.code === 0) && (operation !== "idle")) {
              const { inserted } = lastData.data;
              let change = inserted - (cartTotal * 100);
              setReturnedAmount(change / 100);
              previousDispensed = change / 100;

              // Check if machine has enough change
              // const levelsResponse = await fetch(`${CASHMATIC_API_URL}/device/AllLevels`, {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //     Authorization: `Bearer ${authToken}`,
              //   },
              // });

              // const levelsData = await levelsResponse.json();
              // if (levelsData.code !== 0) {
              //   throw new Error("Failed to fetch machine levels: " + levelsData.message);
              // }

              // const hasExactChange = canProvideExactChange(levelsData.data, change);

              // if (!hasExactChange) {
              //   setPayStatus("Cancelling");
              //   setCashmaticMessage("❌ Machine cannot provide exact change. Returning full amount...");

              //   const withdrawResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartWithdrawal`, {
              //     method: "POST",
              //     headers: {
              //       "Content-Type": "application/json",
              //       Authorization: `Bearer ${authToken}`,
              //     },
              //     body: JSON.stringify({ amount: inserted }),
              //   });

              //   return;
              // } else {


                const withdrawResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartWithdrawal`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({ amount: change }),
                });

                const response = await withdrawResponse.json();
                if (response.code === 0) {
                  const { requested, dispensed } = lastData.data;
                  setReturnedAmount(dispensed);
                  setPayStatus("Dispensing");
                  // setCashmaticMessage(`💵 Dispensing change: $${(dispensed / 100).toFixed(2)} / $${(requested / 100).toFixed(2)}`);
                }
                // const withdrawData = await withdrawResponse.json();
                // const { dispensed, requested } = withdrawData.data;
                // setRequestedAmount(requested);
                // setReturnedAmount(dispensed);
              // }
            }
          }
        }

        // Wait for full change to be dispensed
        if (notDispensed === 0 && operation === "idle" && payStatus !== "Cancelled") {
          // if(payStatus !== "Cancelled"){
            completed = true;
            setPayStatus("Completed");
            setCashmaticMessage(`✅ Payment Completed. Change returned: $${previousDispensed}`);
            setCashmaticProgress(100);

            ////create invoice
            // if(payStatus == "Completed"){

              const invoice = {
                id: `invoice-${Date.now()}`, // Generate a unique ID
                timestamp: Date.now(), // Set creation timestamp
                status: "Paid" as const, // Default status
                customer: customer?.name || "Guest Customer",
                items: cart,
                total: totalAfterAllDiscounts,
                discount: orderDiscountAmount,
                paymentMethod: selectedMethod,
              };
        
              if (customer) {
                createInvoice(invoice);
              } else {
                console.error("Customer information is missing.");
              }
                
              
            // }
            ////create invoice

          // }
        }
      } else {
        setCashmaticMessage(`⚠️ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error tracking payment:", error);
      setCashmaticMessage("❌ Connection error. Please check network and retry.");
    }

    if ((!completed) && (payStatus !== "Cancelled") && (payStatus !== "Completed")) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempt++;
    } else {
      // if(payStatus ==  "Cancelled")
      break;
    }
  }
};

const checkChangeBeforePayment = async (cartTotal, token) => {
  const levelsResponse = await fetch(`${CASHMATIC_API_URL}/device/AllLevels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const levelsData = await levelsResponse.json();
  if (levelsData.code !== 0) {
    toast.error("❌ Error fetching cash levels.");
    return false;
  }

  // Round to nearest whole dollar (no cents)
  const priceDollars = Math.round(cartTotal);
  const canChangeAll = canHandleAllChangePossibilities(levelsData.data, priceDollars);

  if (!canChangeAll) {
    toast.warning("⚠️ Machine may not have enough change. Please insert the exact amount.");
    return false;
  }

  return true; // ✅ Safe to proceed
};




const canHandleAllChangePossibilities = (
  denoms: any[],
  priceDollars: number,
  maxOverpayDollars = 99 // Max: $99 overpay
) => {
  const maxChange = maxOverpayDollars;

  for (let change = 1; change <= maxChange; change++) {
    const isPossible = canProvideExactChange(denoms, change * 100); // convert to cents
    if (!isPossible) {
      console.warn(`🚫 Cannot provide change for overpayment: $${change}`);
      return false;
    }
  }

  return true;
};


const canProvideExactChange = (denominations: any[], change: number) => {
  const sortedDenominations = denominations
    .filter((d) => d.level > 0)
    .sort((a, b) => b.value - a.value);

  let remainingChange = change;

  for (const denomination of sortedDenominations) {
    if (remainingChange === 0) break;

    const maxPossible = Math.min(
      Math.floor(remainingChange / denomination.value),
      denomination.level
    );

    if (maxPossible > 0) {
      remainingChange -= maxPossible * denomination.value;
    }
  }

  return remainingChange === 0;
};



const { createInvoice } = usePOSStore();

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
    // setCashmaticMessage(prevMessage => prevMessage + " Returned Amount: " + dispensedAmount);
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

  if (payStatus.includes('Dispensing')) return;

  try {
    setCashmaticMessage("⏳ Cancelling Payment...");
    setPayStatus("Cancelling");

    // Stop the current deposit
    const stopResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StopDeposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const stopData = await stopResponse.json();
    if (stopData.code !== 0) throw new Error("Stop deposit failed: " + stopData.message);

    // Withdraw the inserted amount
    setCashmaticMessage("💵 Returning inserted cash...");
    const withdrawResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartWithdrawal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: insertedAmount }),
    });
    const withdrawData = await withdrawResponse.json();
    if (withdrawData.code !== 0) throw new Error("Withdrawal failed: " + withdrawData.message);

    // Track withdrawal completion
    let withdrawalAttempts = 0;
    let withdrawalCompleted = false;
    while (withdrawalAttempts < 30 && !withdrawalCompleted) {
      const activeTxn = await fetch(`${CASHMATIC_API_URL}/device/ActiveTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const activeData = await activeTxn.json();
      if (activeData.code === 0) {
        const { dispensed, notDispensed, operation } = activeData.data;
        setReturnedAmount(dispensed / 100);
        if (notDispensed === 0 && operation === "idle") {
          withdrawalCompleted = true;
          break;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      withdrawalAttempts++;
    }

    setPayStatus("Cancelled");
    setCashmaticMessage(`❌ Payment Cancelled. Returned: $${(insertedAmount / 100).toFixed(2)}`);
    setReturnedAmount(insertedAmount / 100);
  } catch (error) {
    setCashmaticMessage(`❌ Cancellation Error: ${error.message}`);
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
        status={payStatus} 
        message={cashmaticMessage} 
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

// Update the CashmaticPaymentDialog component with these changes
interface CashmaticPaymentDialogProps {
  isOpen: boolean;
  status: string;
  message: string;
  progress: number;
  inserted: number;
  requested: number;
  returnedAmount: number;
  onClose: () => void;
  cancelPayment: () => void;
}

const CashmaticPaymentDialog: React.FC<CashmaticPaymentDialogProps> = ({ 
  isOpen, 
  status, 
  message, 
  progress, 
  inserted, 
  requested, 
  returnedAmount, 
  onClose, 
  cancelPayment 
}) => {
  const getStatusIcon = () => {
    if (status.includes("Logging") || status.includes("Checking")) {
      return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
    }
    if (status.includes("Processing") || status.includes("Dispensing")) {
      return <Clock className="w-12 h-12 text-purple-500 animate-pulse" />;
    }
    if (status.includes("Completed")) {
      return <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />;
    }
    if (status.includes("Cancelled")) {
      return <XCircle className="w-12 h-12 text-red-500 animate-pulse" />;
    }
    if (message.includes("Error")) {
      return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
    return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
  };

  const getStatusMessage = () => {
    if (status.includes("Dispensing")) {
      return `Dispensing change: €${returnedAmount.toFixed(2)}`;
    }
    if (status.includes("Cancelling")) {
      return "Cancelling transaction and returning funds...";
    }
    if (status.includes("Checking")) {
      return "Verifying exact change availability...";
    }
    return message;
  };

  const getProgressColor = () => {
    if (status.includes("Cancelled")) return "bg-red-500";
    if (status.includes("Dispensing")) return "bg-purple-500";
    if (status.includes("Checking")) return "bg-yellow-500";
    if (progress < 50) return "bg-yellow-500";
    if (progress < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  useEffect(() => {
    let timer;
    if (isOpen && status.includes("Completed")) {
      timer = setTimeout(() => onClose(), 7000); // Shorter timeout for completed
    }
    return () => clearTimeout(timer);
  }, [isOpen, status, onClose]);

  return (
    <Dialog open={isOpen} modal onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {status.includes("Cancelled") ? "❌ Payment Cancelled" : "💵 Cashmatic Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center mt-4 space-y-3">
          {getStatusIcon()}

          <p className="mt-2 text-gray-800 text-lg font-semibold">
            {getStatusMessage()}
          </p>

          {(inserted !== null && requested !== null) && (
            <div className="space-y-1">
              {!status.includes("Cancelled") && !status.includes("Dispensing") && !status.includes("Completed") && (
                <p className="text-gray-600 text-sm">
                  Inserted: €{(inserted / 100).toFixed(2)} / Needed: €{(requested / 100).toFixed(2)}
                </p>
              )}
              {returnedAmount > 0 && (
                <p className={`text-sm ${
                  status.includes("Cancelled") ? "text-red-600" : "text-green-600"
                }`}>
                  {status.includes("Cancelled") ? "Returned: " : "Change: "}
                  €{returnedAmount.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {!status.includes("Cancelled") && (
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${status.includes("Checking") ? 100 : progress}%` }}
              >
                {status.includes("Checking") && (
                  <div className="animate-pulse bg-white/30 w-full h-full rounded-full" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6 w-full">
          {!status.includes("Cancelled") && 
           !status.includes("Completed") && 
           !status.includes("Dispensing") && (
            <button
              onClick={cancelPayment}
              className="flex-1 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50"
              disabled={status.includes("Checking")}
            >
              {status.includes("Checking") ? "Processing..." : "Cancel Payment"}
            </button>
          )}

          {(status.includes("Cancelled") || status.includes("Completed")) && (
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 text-white bg-gray-700 hover:bg-gray-800 rounded-lg font-medium transition"
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

