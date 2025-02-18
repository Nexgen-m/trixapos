import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";

interface CartItemEditDialogProps {
  item: {
    item_code: string;
    item_name: string;
    price_list_rate: number;
    qty: number;
    stock_qty: number;
    discount?: number;
    uom: string;
    warehouse: string;
    conversion_factor?: number;
  };
  updateItem: (item_code: string, qty: number, price: number, discount: number) => void;
}

export function CartItemEditDialog({ item, updateItem }: CartItemEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(item.qty);
  const [price, setPrice] = useState(item.price_list_rate);
  const [discount, setDiscount] = useState(item.discount || 0);

  // Calculate total dynamically
  const totalAmount = (quantity * price) - discount;

  const handleSave = () => {
    updateItem(item.item_code, quantity, price, discount);
    setOpen(false); // Close dialog after saving
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  useEffect(() => {
    setQuantity(item.qty);
    setPrice(item.price_list_rate);
    setDiscount(item.discount || 0);
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent onKeyDown={handleKeyPress} className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Edit {item.item_name}</DialogTitle>
          <p className="text-sm text-gray-500">Update the item's quantity, price, and discount.</p>
        </DialogHeader>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <Input type="number" value={quantity} min={1} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount</label>
          <Input type="number" value={discount} min={0} onChange={(e) => setDiscount(Number(e.target.value))} />
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* UOM */}
          <div>
            <label className="block text-sm font-medium text-gray-700">UOM</label>
            <Input type="text" value={item.uom} disabled />
          </div>

          {/* Conversion Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Conversion Factor</label>
            <Input type="number" value={item.conversion_factor || 1} disabled />
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Warehouse</label>
            <Input type="text" value={item.warehouse} disabled />
          </div>

          {/* Available Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Stock</label>
            <Input type="number" value={item.stock_qty} disabled />
          </div>
        </div>

        {/* Total Amount */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
          <Input type="text" value={`$ ${totalAmount.toFixed(2)}`} disabled className="font-semibold text-gray-900" />
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
