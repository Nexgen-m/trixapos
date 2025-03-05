import React from "react";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, discount, total }) => (
  <div className="border-t border-gray-800 p-4">
    <div className="space-y-3 text-sm text-gray-400">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Discount</span>
        <span>-${discount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>$0.00</span>
      </div>
    </div>

    {/* Total */}
    <div className="pt-3 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-gray-300">Total</span>
        <span className="text-xl font-bold text-blue-400">${total.toFixed(2)}</span>
      </div>
    </div>
  </div>
);
