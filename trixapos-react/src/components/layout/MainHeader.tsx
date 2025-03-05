import React from 'react';
import { Store } from 'lucide-react';

interface MainHeaderProps {
  companyInfo?: {
    name: string;
    branch?: string;
  };
}

export function MainHeader({ companyInfo }: MainHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <Store className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {companyInfo?.name || 'TrixaPOS'}
          </h1>
          {companyInfo?.branch && (
            <p className="text-sm text-blue-600">Branch: {companyInfo.branch}</p>
          )}
        </div>
      </div>
    </div>
  );
}
