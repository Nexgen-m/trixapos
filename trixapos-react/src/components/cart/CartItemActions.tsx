import React from "react";
import { Plus, Minus } from "lucide-react";

interface CartItemActionsProps {
  itemCode: string;
  quantity: number;
  updateQuantity: (itemCode: string, newQty: number) => void;
}

export function CartItemActions({
  itemCode,
  quantity,
  updateQuantity,
}: CartItemActionsProps) {
  const handleIncrease = () => {
    updateQuantity(itemCode, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(itemCode, quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-1 relative"> {/* ✅ Ensure buttons are not blocked */}
      <button
        onClick={handleDecrease}
        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 relative z-10"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center text-sm text-gray-300">{quantity}</span>
      <button
        onClick={handleIncrease} // ✅ Ensure click event is working
        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 relative z-10"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
