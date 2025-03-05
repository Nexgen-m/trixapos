// NumberPad.tsx: Manages number input functionality

import React from 'react';

interface NumberPadProps {
  onNumberInput: (value: string) => void;
  onExactPayment: () => void;
  onRoundUpPayment: () => void;
  onOpenCalculator: () => void;
  totalAmount: number; // New prop to help with exact and round up calculations
}

export function NumberPad({ 
  onNumberInput, 
  onExactPayment, 
  onRoundUpPayment, 
  onOpenCalculator,
  totalAmount
}: NumberPadProps) {
  const handleNumberInput = (value: string) => {
    // Prevent leading zeros
    if (value !== '.' && value !== 'backspace' && value !== 'clear') {
      onNumberInput(value);
      return;
    }
    
    // Handle special cases
    onNumberInput(value);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Quick action buttons */}
      <div className="col-span-4 grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={onExactPayment}
          className="p-2 text-m font-medium rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          Exact
        </button>
        <button
          onClick={onRoundUpPayment}
          className="p-2 text-m font-medium rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          Round Up
        </button>
        <button
          onClick={onOpenCalculator}
          className="p-2 text-m font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Calculator
        </button>
      </div>

      {/* Number buttons */}
      <div className="col-span-3 grid grid-cols-3 gap-2">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num.toString())}
            className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Control buttons */}
      <div className="col-span-1 grid grid-cols-1 gap-2">
        <button
          onClick={() => onNumberInput('backspace')}
          className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          ←
        </button>
        <button
          onClick={() => onNumberInput('clear')}
          className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          C
        </button>
        <button
          onClick={() => onNumberInput('.')}
          className="aspect-square py-1 px-1 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          .
        </button>
      </div>

      {/* Zero button */}
      <button
        onClick={() => handleNumberInput('0')}
        className="col-span-3 p-2 text-2xl font-medium rounded-xl bg-white border hover:bg-gray-50 transition-colors"
      >
        0
      </button>
    </div>
  );
}