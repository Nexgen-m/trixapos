import { X, Receipt, Check, CreditCard } from 'lucide-react';
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
    customer // Added customer from the store
  } = usePOSStore();
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
              />
              
              {/* Order Discount Input - Readonly if not allowed */}
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