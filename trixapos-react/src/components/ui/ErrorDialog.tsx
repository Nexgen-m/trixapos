import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ErrorDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({ isOpen, message, onClose }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Error
          </DialogTitle>
        </DialogHeader>
        {/* Added text-center and whitespace-pre-line classes to center text and honor newlines */}
        <DialogDescription className="mt-2 text-sm text-red-600 text-center whitespace-pre-line font-semibold ">
          {message}
        </DialogDescription>
        <DialogFooter className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition "
          >
            Okay
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
