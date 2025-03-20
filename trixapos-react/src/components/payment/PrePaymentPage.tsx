import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Gift, 
  Tag, 
  User,
  X,
  Scan,
  AlertCircle
} from 'lucide-react';

interface PrePaymentPageProps {
  isOpen: boolean;
  onClose: () => void; // For closing both dialogs
  onSkip: () => void; // For skipping to PaymentPage
  onProceed: () => void; // For proceeding to PaymentPage
  total: number;
}

export function PrePaymentPage({ isOpen, onClose, onSkip, onProceed, total }: PrePaymentPageProps) {
  const [loyaltyCard, setLoyaltyCard] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCard, setGiftCard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false); // State for scan dialog

  // Check if at least one field is filled
  const isProceedDisabled = !loyaltyCard && !couponCode && !giftCard;

  const handleSubmit = () => {
    // Here you would typically validate the codes and apply discounts
    // For now, we'll just proceed to payment
    onProceed();
  };

  const handleLoyaltySearch = () => {
    if (!loyaltyCard) {
      setError('Please enter a loyalty card number');
      return;
    }
    // Simulate loyalty card validation
    setError(null);
  };

  const handleCouponApply = () => {
    if (!couponCode) {
      setError('Please enter a coupon code');
      return;
    }
    // Simulate coupon validation
    setError(null);
  };

  const handleGiftCardApply = () => {
    if (!giftCard) {
      setError('Please enter a gift card number');
      return;
    }
    // Simulate gift card validation
    setError(null);
  };

  const handleScan = () => {
    // Simulate scanning a loyalty card
    const scannedCardNumber = 'SCANNED_LOYALTY_CARD'; // Replace with actual scanned data
    setLoyaltyCard(scannedCardNumber); // Populate the loyalty card field
    setIsScanDialogOpen(false); // Close the scan dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Additional Options</DialogTitle>
            {/* <button
              onClick={onClose} // Close button triggers onClose
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Total Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Current Total</div>
            <div className="text-2xl font-bold text-blue-700">${total.toFixed(2)}</div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loyalty Card */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Loyalty Card
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter loyalty card number"
                value={loyaltyCard}
                onChange={(e) => setLoyaltyCard(e.target.value)}
              />
              <Button variant="outline" onClick={() => setIsScanDialogOpen(true)}>
                <Scan className="w-4 h-4" />
              </Button>
            </div>
            <a
              href="#create-loyalty-card" // Replace with actual link or handler
              className="text-sm text-blue-600 hover:underline"
            >
              Don't have a loyalty card? Create one
            </a>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4" />
              Coupon Code
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outline" onClick={handleCouponApply}>Apply</Button>
            </div>
          </div>

          {/* Gift Card */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Gift className="w-4 h-4" />
              Gift Card
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter gift card number"
                value={giftCard}
                onChange={(e) => setGiftCard(e.target.value)}
              />
              <Button variant="outline" onClick={handleGiftCardApply}>Apply</Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isProceedDisabled} // Disable if no input is entered
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>

            {/* Skip To Payment Hyperlink */}
            <a
  href="#skip"
  onClick={(e) => {
    e.preventDefault();
    onSkip();
  }}
  className="text-[12px] text-gray-500 hover:underline text-center cursor-pointer"
>
  Skip To Payment
</a>

          </div>
        </div>
      </DialogContent>

      {/* Scan Dialog */}
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Scan Loyalty Card</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Please scan your loyalty card barcode using the scanner.
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleScan}
            >
              <Scan className="w-4 h-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}