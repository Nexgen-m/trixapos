import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function OptionsMenu() {
  const [isCompactMode, setIsCompactMode] = useState(false);

  const handleModeChange = () => {
    setIsCompactMode(!isCompactMode);
    // Additional logic to apply the selected mode can be added here
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Display Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isCompactMode}
              onChange={handleModeChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {isCompactMode ? 'Compact Mode' : 'Full Mode'}
            </span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
