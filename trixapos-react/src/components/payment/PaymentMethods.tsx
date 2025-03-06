// PaymentMethods.tsx: Handles payment method selection


import React from 'react';
import { Check } from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod } from './constants';

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

export function PaymentMethods({ 
  selectedMethod, 
  onSelectMethod 
}: PaymentMethodsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {PAYMENT_METHODS.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelectMethod(method.id)}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
            selectedMethod === method.id
              ? 'bg-gray-900 text-white border-gray-700 shadow-md'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className={`p-1 rounded-lg ${selectedMethod === method.id ? method.color : 'bg-gray-100'}`}>
            {React.cloneElement(method.icon as React.ReactElement<any>, {
              className: `w-5 h-5 ${selectedMethod === method.id ? 'text-white' : 'text-gray-600'}`
            })}
          </div>
          <span className="text-xs font-medium">{method.name}</span>
          {selectedMethod === method.id && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}