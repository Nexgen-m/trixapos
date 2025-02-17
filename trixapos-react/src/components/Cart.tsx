import React from "react";
import { Trash2 } from "lucide-react";
import { usePOSStore } from "../store/posStore";

export function Cart() {
  const { cart, removeFromCart } = usePOSStore();

  // ✅ Ensure `price_list_rate` and `qty` have default values to prevent NaN
  const total = cart.reduce((sum, item) => sum + (item.price_list_rate || 0) * (item.qty || 1), 0);

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.item_code}
              className="flex flex-col mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Item Name & Remove Button */}
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                <button onClick={() => removeFromCart(item.item_code)} aria-label={`Remove ${item.item_name}`}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>

              {/* ✅ Quantity, Price, and Total Price */}
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>Qty: {item.qty || 1}</span>
                <span>Price: ${item.price_list_rate?.toFixed(2) || "0.00"}</span>
                <span className="font-semibold text-gray-900">
                  Total: ${(item.qty || 1) * (item.price_list_rate || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Fixed Total Section - Stays at Bottom */}
      <div className="p-4 border-t border-gray-200 bg-blue-600 sticky bottom-0">
        <div className="flex justify-between mb-4">
          <span className="font-medium text-white">Total</span>
          <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
