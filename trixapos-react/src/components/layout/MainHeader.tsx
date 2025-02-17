import React from 'react';
import { Store, ChevronDown } from 'lucide-react';

interface MainHeaderProps {
  companyInfo?: {
    name: string;
    branch?: string;
  };
}

export function MainHeader({ companyInfo }: MainHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              <span>Options</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}