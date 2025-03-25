// components/CashmaticDialog.tsx
import { Loader, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from 'react';

interface CashmaticDialogProps {
  isOpen: boolean;
  status: string;
  message: string;
  progress: number;
  inserted: number;
  requested: number;
  returnedAmount: number;
  onClose: () => void;
  onCancel: () => void;
}

export const CashmaticDialog = ({
  isOpen,
  status,
  message,
  progress,
  inserted,
  requested,
  returnedAmount,
  onClose,
  onCancel,
}: CashmaticDialogProps) => {
  const getStatusIcon = () => {
    if (status.includes("Logging") || status.includes("Checking")) {
      return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
    }
    if (status.includes("Processing") || status.includes("Dispensing")) {
      return <Clock className="w-12 h-12 text-purple-500 animate-pulse" />;
    }
    if (status.includes("Completed")) {
      return <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />;
    }
    if (status.includes("Cancelled")) {
      return <XCircle className="w-12 h-12 text-red-500 animate-pulse" />;
    }
    if (message.includes("Error")) {
      return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
    return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
  };

  const getStatusMessage = () => {
    if (status.includes("Dispensing")) {
      return `Dispensing change: €${returnedAmount.toFixed(2)}`;
    }
    if (status.includes("Cancelling")) {
      return "Cancelling transaction and returning funds...";
    }
    if (status.includes("Checking")) {
      return "Verifying exact change availability...";
    }
    return message;
  };

  const getProgressColor = () => {
    if (status.includes("Cancelled")) return "bg-red-500";
    if (status.includes("Dispensing")) return "bg-purple-500";
    if (status.includes("Checking")) return "bg-yellow-500";
    if (progress < 50) return "bg-yellow-500";
    if (progress < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && status.includes("Completed")) {
      timer = setTimeout(() => onClose(), 7000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, status, onClose]);

  return (
    <Dialog open={isOpen} modal onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {status.includes("Cancelled") ? "❌ Payment Cancelled" : "💵 Cashmatic Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center mt-4 space-y-3">
          {getStatusIcon()}

          <p className="mt-2 text-gray-800 text-lg font-semibold">
            {getStatusMessage()}
          </p>

          {(inserted !== null && requested !== null) && (
            <div className="space-y-1">
              {!status.includes("Cancelled") && !status.includes("Dispensing") && !status.includes("Completed") && (
                <p className="text-gray-600 text-sm">
                  Inserted: €{(inserted / 100).toFixed(2)} / Needed: €{(requested / 100).toFixed(2)}
                </p>
              )}
              {returnedAmount > 0 && (
                <p className={`text-sm ${
                  status.includes("Cancelled") ? "text-red-600" : "text-green-600"
                }`}>
                  {status.includes("Cancelled") ? "Returned: " : "Change: "}
                  €{returnedAmount.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {!status.includes("Cancelled") && (
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${status.includes("Checking") ? 100 : progress}%` }}
              >
                {status.includes("Checking") && (
                  <div className="animate-pulse bg-white/30 w-full h-full rounded-full" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6 w-full">
          {!status.includes("Cancelled") && 
           !status.includes("Completed") && 
           !status.includes("Dispensing") && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50"
              disabled={status.includes("Checking")}
            >
              {status.includes("Checking") ? "Processing..." : "Cancel Payment"}
            </button>
          )}

          {(status.includes("Cancelled") || status.includes("Completed")) && (
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 text-white bg-gray-700 hover:bg-gray-800 rounded-lg font-medium transition"
            >
              Close
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};