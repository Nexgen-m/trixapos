import React from "react";
import { ShoppingCart, Receipt } from "lucide-react";

interface CartHeaderProps {
  itemCount: number;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount }) => (
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
);
