import React from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { CartItemActions } from "./CartItemActions";
import { CartItemEditDialog } from "./CartItemEditDialog";
import { Package, Pencil, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    item_code: string;
    item_name: string;
    price_list_rate: number;
    qty: number;
    stock_qty: number;
    discount?: number; // Discount is now percentage-based
    uom: string;
    warehouse: string;
    conversion_factor?: number;
    image?: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, updateItem } = usePOSStore();

  // ✅ Calculate Total Price after Discount is Applied
  const subtotal = item.price_list_rate * item.qty;
  const discountAmount = (subtotal * (item.discount || 0)) / 100; // Apply discount as percentage
  const totalPrice = subtotal - discountAmount; // Final Total

  return (
    <div className="px-3 py-2 border-b border-gray-700">
      {/* Product Details (First Row) */}
      <div className="flex items-center">
        {/* Product Image and Name */}
        <div className="w-1/3 flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.item_name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Package className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-200 break-words">{item.item_name}</p> {/* ✅ Wrap Item Name */}
          </div>
        </div>

        {/* Unit Price */}
        <div className="w-1/4 text-xs text-blue-400 text-center">
          ${item.price_list_rate.toFixed(2)}
        </div>

        {/* Quantity (Editable) - Removed Trash Icon Here */}
        <div className="w-1/6 flex justify-right">
          <CartItemActions
            itemCode={item.item_code}
            quantity={item.qty}
            updateQuantity={updateQuantity}
          />
        </div>

        {/* Total Price */}
        <div className="w-1/4 text-right text-sm font-medium text-gray-300">
          ${totalPrice.toFixed(2)}
        </div>
      </div>

      {/* Action Buttons (Second Row) */}
      <div className="flex justify-end items-center mt-2 gap-3">
        {/* Edit Button */}
        <CartItemEditDialog item={item} updateItem={updateItem}>
          <button className="p-1 rounded text-gray-500 hover:text-gray-300">
            <Pencil className="w-4 h-4" />
          </button>
        </CartItemEditDialog>

        {/* Remove Button - Now Uses the Same Red Color as the One You Circled */}
        <button 
          onClick={() => removeFromCart(item.item_code)}
          className="p-1 rounded hover:bg-red-900/30 text-red-400 hover:text-red-300 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
