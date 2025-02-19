import React from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { CartItemActions } from "./CartItemActions";
import { CartItemEditDialog } from "./CartItemEditDialog";

interface CartItemProps {
  item: {
    item_code: string;
    item_name: string;
    price_list_rate: number;
    qty: number;
    stock_qty: number;
    discount?: number;
    uom: string;
    warehouse: string;
    conversion_factor?: number;
  };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, updateItem } = usePOSStore();
  const totalPrice = (item.price_list_rate * item.qty) - (item.discount || 0);

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
      {/* Item Header */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">{item.item_name}</h4>
        <CartItemEditDialog item={item} updateItem={updateItem} />
      </div>

      {/* Quantity, Price, and Total */}
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <CartItemActions itemCode={item.item_code} quantity={item.qty} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
        <span className="text-center">${item.price_list_rate.toFixed(2)}</span>
        <span className="text-right font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
