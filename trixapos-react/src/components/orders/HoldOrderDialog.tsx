import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { X, User } from "lucide-react";

interface HoldOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HoldOrderDialog({ isOpen, onClose }: HoldOrderDialogProps) {
  const { cart, total, customer, holdOrder } = usePOSStore();
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const draftName = note || "Untitled Hold"; // Use note input or a default name
    const orderTotal = total; // Get total from store
    const customerName = customer?.customer_name || "Guest"; // Default if no customer selected

    holdOrder(draftName, orderTotal, customerName); // Save the order
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Hold Order</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Customer Info */}
            <div className="space-y-3 pb-4 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">
                    {customer?.customer_name || "No Customer Selected"}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Items in cart:</span>
              <span className="font-medium">{cart.length}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Add a note (optional)
            </label>
            <Input
              placeholder="Enter a note for this order"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              Hold Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
