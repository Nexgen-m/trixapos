import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";

interface CartItemActionsProps {
  itemCode: string;
  quantity: number;
  updateQuantity: (itemCode: string, newQty: number) => void;
  removeFromCart: (itemCode: string) => void;
}

export function CartItemActions({ itemCode, quantity, updateQuantity, removeFromCart }: CartItemActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateQuantity(itemCode, Math.max(1, quantity - 1))}
        className="p-1 border rounded-md"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span>{quantity}</span>
      <button
        onClick={() => updateQuantity(itemCode, quantity + 1)}
        className="p-1 border rounded-md"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button onClick={() => removeFromCart(itemCode)} aria-label="Remove">
        <Trash2 className="h-4 w-4 text-red-600" />
      </button>
    </div>
  );
}
