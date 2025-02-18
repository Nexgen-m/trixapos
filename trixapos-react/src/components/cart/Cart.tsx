import React from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { CartItem } from "./CartItem";

export function Cart() {
  const { cart } = usePOSStore();
  const total = cart.reduce((sum, item) => sum + (item.price_list_rate * item.qty - (item.discount || 0)), 0);

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Labels Row */}
      <div className="p-2 bg-gray-200 text-gray-700 font-medium text-sm flex justify-between px-4 border-b border-gray-300">
        <span className="w-1/3">Quantity</span>
        <span className="w-1/3 text-center">Price</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty</p>
        ) : (
          cart.map((item) => <CartItem key={item.item_code} item={item} />)
        )}
      </div>

      {/* Fixed Total */}
      <div className="p-4 border-t border-gray-200 bg-blue-600 sticky bottom-0">
        <div className="flex justify-between mb-4">
          <span className="font-medium text-white">Total</span>
          <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
