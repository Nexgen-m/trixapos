import React from 'react';
import { Menu, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  username?: string;
}

export function TopBar({ isSidebarOpen, setIsSidebarOpen, username }: TopBarProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-blue-600">
      <div className="mx-auto px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(currentTime, 'HH:mm:ss')}</span>
            <span className="text-blue-200">|</span>
            <span>{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {username && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Welcome, {username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}