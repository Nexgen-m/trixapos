import React, { useState } from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { CartItem } from "./CartItem";
import {
  ShoppingCart,
  Package,
  Receipt,
  Calculator,
  Trash2,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorComponent } from "../calculator/Calculator";
import { PaymentPage } from "../payment/PaymentPage";
import { PrePaymentPage } from "../payment/PrePaymentPage"; // Import PrePaymentPage
import { HoldOrderDialog } from "../orders/HoldOrderDialog"; // Import the HoldOrderDialog

export function Cart() {
  const [isHoldDialogOpen, setHoldDialogOpen] = useState(false); // State for HoldOrderDialog
  const [isPrePaymentOpen, setIsPrePaymentOpen] = useState(false); // State for PrePaymentPage
  const [isPaymentOpen, setIsPaymentOpen] = useState(false); // State for PaymentPage
  const [isCalculatorOpen, setCalculatorOpen] = useState(false); // State for Calculator

  const { cart, clearCart, orderDiscount, holdOrder, total } = usePOSStore();

  // Calculate subtotal (price * quantity for all items)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price_list_rate * item.qty,
    0
  );

  // Calculate Item Discount as percentage-based
  const itemDiscountAmount = cart.reduce(
    (sum, item) =>
      sum + (item.price_list_rate * item.qty * (item.discount || 0)) / 100,
    0
  );

  // Calculate order discount amount based on percentage
  const orderDiscountAmount =
    (subtotal - itemDiscountAmount) * (orderDiscount / 100);

  // Calculate final total after both item discounts and order discount
  const totalAfterDiscounts = subtotal - itemDiscountAmount - orderDiscountAmount;

  // Count total items in the cart
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Handle Pay button click
  const handlePayClick = () => {
    setIsPrePaymentOpen(true); // Open PrePaymentPage
  };

  // Handle PrePaymentPage close (Skip or Proceed)
  const handlePrePaymentClose = () => {
    setIsPrePaymentOpen(false); // Close PrePaymentPage
    setIsPaymentOpen(true); // Open PaymentPage
  };

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-100">Current Order</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 bg-gray-800 px-2 py-1 rounded">
            <Receipt className="w-4 h-4" />
            <span className="text-sm">{itemCount} items</span>
          </div>
        </div>
      </div>

      {/* Table Header for Cart Items */}
      {cart.length > 0 && (
        <div className="px-3 py-2 bg-gray-700 text-gray-300 text-sm font-medium flex justify-between border-b border-gray-600">
          <div className="w-1/3">Product Name</div>
          <div className="w-1/4 text-center">Unit Price</div>
          <div className="w-1/6 text-center">Qty</div>
          <div className="w-1/4 text-right">Total</div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <Package className="w-12 h-12 mb-2" />
            <p className="text-base">Your cart is empty</p>
            <p className="text-sm text-gray-600">Add items to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {cart.map((item) => (
              <CartItem
                key={item.item_code}
                item={{
                  ...item,
                  uom: item.uom || "",
                  warehouse: item.warehouse || "",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-800">
        <div className="p-4 space-y-3">
          {/* Summary Details */}
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Item Discount</span>
              <span>-${itemDiscountAmount.toFixed(2)}</span>
            </div>

            {/* Order Discount Display */}
            {orderDiscount > 0 && (
              <div className="flex justify-between">
                <span>Order Discount ({orderDiscount}%)</span>
                <span>-${orderDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total</span>
              <span className="text-xl font-bold text-blue-400">
                ${Math.max(0, totalAfterDiscounts).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-3">
            {/* Reset Order Button */}
            <Button
              size="sm"
              variant="outline"
              className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-700"
              disabled={cart.length === 0}
              onClick={clearCart}
            >
              <Trash2 className="w-4 h-4" /> Reset
            </Button>

            {/* Hold Order Button */}
            <Button
              size="sm"
              variant="outline"
              className="bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-700"
              disabled={cart.length === 0}
              onClick={() => setHoldDialogOpen(true)} // Open the HoldOrderDialog
            >
              <PauseCircle className="w-4 h-4" /> Hold
            </Button>

            {/* Calculator Button - Always Clickable */}
            <Button
              size="sm"
              variant="outline"
              className="bg-gray-600 text-white hover:bg-gray-700"
              onClick={() => setCalculatorOpen(true)} // Open calculator
            >
              <Calculator className="w-4 h-4" /> Calc
            </Button>

            {/* Pay Button - Opens PrePaymentPage */}
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400"
              disabled={cart.length === 0}
              onClick={handlePayClick} // Open PrePaymentPage
            >
              Pay
            </Button>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      <CalculatorComponent
        isOpen={isCalculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      {/* PrePaymentPage */}
      <PrePaymentPage
        isOpen={isPrePaymentOpen}
        onClose={handlePrePaymentClose} // Skip or Proceed triggers this
        onProceed={handlePrePaymentClose} // Proceed triggers this
        total={totalAfterDiscounts}
      />

      {/* PaymentPage */}
      <PaymentPage
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* HoldOrderDialog */}
      <HoldOrderDialog
        isOpen={isHoldDialogOpen}
        onClose={() => setHoldDialogOpen(false)}
      />
    </div>
  );
}