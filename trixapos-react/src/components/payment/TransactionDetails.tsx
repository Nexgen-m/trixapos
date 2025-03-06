import React from 'react';
import { CartItem } from '@/types/pos';

interface TransactionDetailsProps {
  total: number;
  cart: CartItem[];
  amountPaid: string;
  itemDiscounts: number;
  orderDiscount?: number;
  orderDiscountAmount?: number;
  paymentComplete: boolean;
  formatCurrency: (amount: number) => string;
  change: number;
  remaining: number;
  loyaltyCard?: string; // NEW Loyalty Card Field
}

export function TransactionDetails({
  total,
  cart,
  amountPaid,
  itemDiscounts,
  orderDiscount = 0,
  orderDiscountAmount = 0,
  paymentComplete,
  formatCurrency,
  change,
  remaining,
  loyaltyCard, // NEW
}: TransactionDetailsProps) {
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <h3 className="font-medium text-gray-900 mb-3">Transaction Details</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Items</span>
          <span className="text-gray-900">{itemCount}</span>
        </div>

        {/* Loyalty Card Info (If Available) */}
        {loyaltyCard && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Loyalty Card</span>
            <span className="text-gray-900">{loyaltyCard}</span>
          </div>
        )}

        {/* Highlight Discounts in Green */}
        <div className="flex justify-between text-sm text-green-600">
          <span>Item Discounts</span>
          <span>{formatCurrency(itemDiscounts)}</span>
        </div>

        {orderDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Order Discount ({orderDiscount}%)</span>
            <span>{formatCurrency(orderDiscountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100">
          <span className="text-gray-700">Total</span>
          <span className="text-gray-900">{formatCurrency(total)}</span>
        </div>
        
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-700">Amount Paid</span>
          <span className="text-gray-900">{formatCurrency(amountPaidNum)}</span>
        </div>
        
        {paymentComplete ? (
          <div className="flex justify-between text-sm font-medium text-green-600">
            <span>Change</span>
            <span>{formatCurrency(change)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Remaining</span>
            <span className={remaining > 0 ? "text-orange-600" : "text-gray-900"}>
              {formatCurrency(remaining)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
