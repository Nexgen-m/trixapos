// constants.ts: Stores constant data like payment methods
import React from 'react';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Smartphone 
} from 'lucide-react';

import cashmatic from '@/assets/cashmatic-icon.png';

// const CashmaticIcon = () => (
//   <img src={cashmatic} alt="Cashmatic" className="w-6 h-6" />
// );

export type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    id: 'cash', 
    name: 'Cash', 
    icon: React.createElement(Banknote, { className: "w-6 h-6" }),
    color: 'bg-emerald-500'
  },
  { 
    id: 'card', 
    name: 'Card', 
    icon: React.createElement(CreditCard, { className: "w-6 h-6" }),
    color: 'bg-blue-500'
  },
  // { 
  //   id: 'wallet', 
  //   name: 'E-Wallet', 
  //   icon: React.createElement(Wallet, { className: "w-6 h-6" }),
  //   color: 'bg-purple-500'
  // },
  { 
    id: 'cashmatic', 
    name: 'Cashmatic', 
    icon: React.createElement(Wallet, { className: "w-6 h-6" }),
    // icon: <CashmaticIcon />,
    color: 'bg-white'
  },
  { 
    id: 'mobile', 
    name: 'Mobile Pay', 
    icon: React.createElement(Smartphone, { className: "w-6 h-6" }),
    color: 'bg-orange-500'
  },
];