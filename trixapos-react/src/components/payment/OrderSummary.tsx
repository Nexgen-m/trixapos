// OrderSummary.tsx: Shows a detailed order summary

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderSummaryProps {
  cart: any[]; // Replace 'any' with your actual cart item type
  cartTotal: number;
  itemDiscounts: number;
  additionalDiscount: number;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
}

interface OrderSummaryProps {
  cart: any[];
  cartTotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalAfterDiscount: number;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
}

export function OrderSummary({
  cart,
  cartTotal,
  discountPercentage,
  discountAmount,
  totalAfterDiscount,
  formatCurrency,
  onClose
}: OrderSummaryProps) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-20 overflow-hidden">
      <DialogHeader className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <DialogTitle className="text-base font-medium">Order Summary</DialogTitle>
      </DialogHeader>

      <div className="p-4 overflow-y-auto flex-1">
        {/* Items List */}
        <div className="grid grid-cols-3 py-2 border-b text-sm font-medium text-gray-500">
          <div className="col-span-2">Product Name</div>
          <div className="grid grid-cols-3">
            <div className="text-center">Unit Price</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Total</div>
          </div>
        </div>

        <div className="space-y-2 mt-2 flex-1">
          {cart.map((item) => (
            <div key={item.item_code} className="grid grid-cols-3 items-center py-2 border-b">
              <div className="col-span-2 font-medium">{item.item_name}</div>
              <div className="grid grid-cols-3 items-center">
                <div className="text-center">{formatCurrency(item.price_list_rate)}</div>
                <div className="text-center">{item.qty}</div>
                <div className="text-right">{formatCurrency(item.price_list_rate * item.qty)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Updated Totals Section */}
        <div className="mt-auto pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          {discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount ({discountPercentage}%):</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total After Discount:</span>
            <span>{formatCurrency(totalAfterDiscount)}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="p-4 border-t">
        <Button onClick={onClose} className="w-full">
          Back to Payment
        </Button>
      </div>
    </div>
  );
}
