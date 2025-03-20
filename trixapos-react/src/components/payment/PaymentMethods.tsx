// // PaymentMethods.tsx: Handles payment method selection


// import React from 'react';
// import { Check } from 'lucide-react';
// import { PAYMENT_METHODS, PaymentMethod } from './constants';

// interface PaymentMethodsProps {
//   selectedMethod: string;
//   onSelectMethod: (method: string) => void;
// }

// import cashmatic from '@/assets/cashmatic-icon.png';

// // Define the CashmaticIcon component without JSX
// const CashmaticIcon = () =>
//   React.createElement('img', { src: cashmatic, alt: 'Cashmatic', className: 'w-5 h-5 scale-[0.85]' });

// export function PaymentMethods({ 
//   selectedMethod, 
//   onSelectMethod 
// }: PaymentMethodsProps) {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
//       {PAYMENT_METHODS.map((method) => (
//         <button
//           key={method.id}
//           onClick={() => onSelectMethod(method.id)}
//           className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
//             selectedMethod === method.id
//               ? 'bg-gray-900 text-white border-gray-700 shadow-md'
//               : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
//           }`}
//         >
//           <div className={`p-1 rounded-lg ${selectedMethod === method.id ? method.color : 'bg-gray-100'}`}>
//             {method.id == 'cashmatic' ? <CashmaticIcon /> : 
//             ( React.cloneElement(method.icon as React.ReactElement<any>, {
//               className: `w-5 h-5 ${selectedMethod === method.id ? 'text-white' : 'text-gray-600'}`
//             }))}
//           </div>
//           <span className="text-xs font-medium">{method.name}</span>
//           {selectedMethod === method.id && (
//             <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//               <Check className="w-3 h-3 text-white" />
//             </div>
//           )}
//         </button>
//       ))}
//     </div>
//   );
// }


import React from 'react';
import { Check, CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import cashmatic from '@/assets/cashmatic-icon.png';

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  paymentMethods: { id: string; name: string }[];
}

// Cashmatic Icon Component
const CashmaticIcon = () => (
  <img src={cashmatic} alt="Cashmatic" className="w-5 h-5 rounded bg-white p-[2px]" />
);

// Define icons and colors for each payment method
const getPaymentConfig = (methodId: string) => {
  switch (methodId) {
    case "cash":
      return { icon: <Banknote className="w-5 h-5 text-green-600" />, color: "bg-emerald-500" };
    case "card":
    case "credit_card":
      return { icon: <CreditCard className="w-5 h-5 text-blue-600" />, color: "bg-blue-500" };
    case "bank":
    case "bank_transfer":
      return { icon: <Wallet className="w-5 h-5 text-purple-600" />, color: "bg-purple-500" };
    case "mobile":
      return { icon: <Smartphone className="w-5 h-5 text-orange-600" />, color: "bg-orange-500" };
    case "cashmatic":
      return { icon: <CashmaticIcon />, color: "bg-white border border-gray-300" };
    default:
      return { icon: <CreditCard className="w-5 h-5 text-gray-600" />, color: "bg-gray-300" };
  }
};

export function PaymentMethods({ selectedMethod, onSelectMethod, paymentMethods }: PaymentMethodsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {paymentMethods.map((method) => {
        const { icon, color } = getPaymentConfig(method.id);

        return (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
              selectedMethod === method.id
                ? 'bg-gray-900 text-white border-gray-700 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {/* Payment Icon with Dynamic Colors */}
            <div className={`p-1 rounded-lg ${selectedMethod === method.id ? color : 'bg-gray-100'}`}>
              {icon}
            </div>

            {/* Payment Method Name */}
            <span className="text-xs font-medium">{method.name}</span>

            {/* Selected Indicator */}
            {selectedMethod === method.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
