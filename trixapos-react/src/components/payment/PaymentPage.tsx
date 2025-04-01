import { X, Receipt, Check } from "lucide-react";
import { toast } from "sonner";
import { Calculator } from "../calculator/Calculator";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { Input } from "@/components/ui/input";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile";

// Import components
import { PaymentMethods } from "./PaymentMethods";
import { TransactionDetails } from "./TransactionDetails";
import { NumberPad } from "./NumberPad";
import { OrderSummary } from "./OrderSummary";

import { useCashmatic } from "@/hooks/fetchers/useCashmatic";
import { CashmaticDialog } from "./CashmaticDialog";

import cashmatic from "@/assets/cashmatic-icon.png";

const CashmaticIcon = () =>
  React.createElement("img", {
    src: cashmatic,
    alt: "Cashmatic",
    className: "rounded-md p-1 bg-white w-6 h-6 scale-[1]",
  });

interface PaymentPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentPage({ isOpen, onClose }: PaymentPageProps) {
  const { canEditAdditionalDiscount, maxDiscountAllowed } = usePOSProfile();
  const {
    cart,
    total: cartTotal,
    orderDiscount: storeOrderDiscount,
    setOrderDiscount,
    customer,
    isVerticalLayout,
    createInvoice,
  } = usePOSStore();

  const { payments, defaultPaymentMethod } = usePOSProfile();
  const { canProvideCash } = usePOSStore();

  const filteredPayments = canProvideCash
    ? payments
    : payments.filter((method) => method.name !== "Cashmatic");
  const [selectedMethod, setSelectedMethod] = useState(
    defaultPaymentMethod || "cash"
  );

  // Payment-related local states
  const [orderDiscountPercentage, setOrderDiscountPercentage] = useState(
    storeOrderDiscount || 0
  );
  const [amountPaid, setAmountPaid] = useState("");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // On open, set default payment method (if any)
  useEffect(() => {
    if (defaultPaymentMethod) {
      setSelectedMethod(defaultPaymentMethod);
    }
  }, [defaultPaymentMethod]);

  // Calculate item discount amount
  const itemDiscountAmount = cart.reduce(
    (sum, item) =>
      sum + (item.price_list_rate * item.qty * (item.discount || 0)) / 100,
    0
  );

  // Subtotal after item discounts
  const subtotalAfterItemDiscounts =
    cart.reduce((sum, item) => sum + item.price_list_rate * item.qty, 0) -
    itemDiscountAmount;

  // Order discount
  const orderDiscountAmount =
    (subtotalAfterItemDiscounts * orderDiscountPercentage) / 100;

  // Final total
  const totalAfterAllDiscounts =
    subtotalAfterItemDiscounts - orderDiscountAmount;

  // NumberPad logic
  const handleNumberInput = useCallback((value: string) => {
    setAmountPaid((prev) => {
      if (value === "backspace") return prev.slice(0, -1);
      if (value === "clear") return "";
      if (value === ".") {
        if (prev.includes(".")) return prev;
        return prev + (prev === "" ? "0." : ".");
      }
      const newVal = prev + value;
      const formatted = newVal.replace(/^0+(?=\d)/, "");
      const parts = formatted.split(".");
      if (parts.length > 1 && parts[1].length > 2) {
        return parseFloat(formatted).toFixed(2);
      }
      return formatted;
    });
  }, []);

  // “Exact Payment” and “Round Up” buttons
  const handleExactPayment = () => {
    setAmountPaid(totalAfterAllDiscounts.toFixed(2));
  };
  const handleRoundUpPayment = () => {
    setAmountPaid(Math.ceil(totalAfterAllDiscounts).toFixed(2));
  };

  // Discount changes
  const handleOrderDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > maxDiscountAllowed) {
      toast.error(`❌ Error: Discount cannot exceed ${maxDiscountAllowed}%.`);
      setOrderDiscountPercentage(0);
      return;
    }
    setOrderDiscountPercentage(value);
    setOrderDiscount(value);
  };

  // Format currency
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amt);

  // Payment & change
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = Math.max(0, amountPaidNum - totalAfterAllDiscounts);
  const remaining = Math.max(0, totalAfterAllDiscounts - amountPaidNum);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setAmountPaid("");
      setPaymentComplete(false);
      setShowSummary(false);
      setIsCalculatorOpen(false);
      setOrderDiscountPercentage(storeOrderDiscount || 0);
    }
  }, [isOpen, storeOrderDiscount]);

  const handlePayment = async () => {
    const invoice = {
      id: `invoice-${Date.now()}`,
      timestamp: Date.now(),
      customer: customer?.name || "Guest Customer",
      paymentMethod: selectedMethod,
      items: cart,
      total: cartTotal,
    };
    try {
      await createInvoice(invoice);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  // Cashmatic
  const { cashmaticState, cashmaticActions } = useCashmatic();
  const [cashmaticDialogOpen, setCashmaticDialogOpen] = useState(false);

  const handleCashmaticPayment = async () => {
    setCashmaticDialogOpen(true);
    await cashmaticActions.handlePayment(
      totalAfterAllDiscounts,
      customer?.name || "Guest",
      cart
    );
  };
  const handleCancelCashmaticPayment = async () => {
    await cashmaticActions.cancelPayment();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl p-0 bg-gray-100 flex flex-col mx-auto h-auto overflow-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="bg-white px-4 py-3 border-b sticky top-0 z-10 flex items-center">
          <div className="w-1/3 flex items-center">
            {customer?.customer_name && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  Customer:
                </span>
                <span className="ml-2 font-medium text-gray-800 truncate max-w-xs">
                  {customer.customer_name}
                </span>
              </div>
            )}
          </div>
          <div className="w-1/3 flex justify-center">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
          </div>
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
                paymentMethods={filteredPayments}
              />

              {/* Order Discount Input (not visible in vertical layout) */}
              {!isVerticalLayout && (
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Discount (%) (Max: {maxDiscountAllowed}%)
                  </label>
                  <Input
                    type="number"
                    value={orderDiscountPercentage}
                    onChange={handleOrderDiscountChange}
                    className={`w-full p-2 mt-1 text-lg border rounded-lg ${
                      !canEditAdditionalDiscount
                        ? "bg-gray-200 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder={`Enter discount (Max: ${maxDiscountAllowed}%)`}
                    min="0"
                    max={maxDiscountAllowed}
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

          {/* Complete Payment */}
          <div className="mt-4">
            {selectedMethod !== "cashmatic" ? (
              <Button
                onClick={handlePayment}
                className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                disabled={
                  (selectedMethod !== "cashmatic" &&
                    amountPaidNum < totalAfterAllDiscounts) ||
                  paymentComplete
                }
              >
                {paymentComplete ? (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Payment Complete
                  </div>
                ) : (
                  "Complete Payment"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCashmaticPayment}
                className="w-full p-4 text-base rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                disabled={
                  (selectedMethod !== "cashmatic" &&
                    amountPaidNum < totalAfterAllDiscounts) ||
                  paymentComplete
                }
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
            cartTotal={cartTotal}
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

      {/* Cashmatic Dialog */}
      <CashmaticDialog
        isOpen={cashmaticDialogOpen}
        status={cashmaticState.status}
        message={cashmaticState.message}
        progress={cashmaticState.progress}
        inserted={cashmaticState.inserted}
        requested={cashmaticState.requested}
        returnedAmount={cashmaticState.returned}
        onClose={() => {
          setCashmaticDialogOpen(false);
          onClose();
        }}
        onCancel={handleCancelCashmaticPayment}
      />
    </Dialog>
  );
}
