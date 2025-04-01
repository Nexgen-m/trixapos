import React, { useState, useEffect, ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile"; // ✅ Import the Store

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
  updateItem: (
    item_code: string,
    qty: number,
    price: number,
    discount: number
  ) => void;
  children?: ReactNode;
}

export function CartItemEditDialog({
  item,
  updateItem,
  children,
}: CartItemEditDialogProps) {
  const { canEditItemDiscount, canEditItemPrice, allowItemDiscount } =
    usePOSProfile(); // ✅ New field
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(item.qty);
  const [price, setPrice] = useState(item.price_list_rate);
  const [discount, setDiscount] = useState(item.discount || 0);
  const [uom, setUom] = useState(item.uom);
  const [warehouse, setWarehouse] = useState(item.warehouse);
  const [conversionFactor, setConversionFactor] = useState(
    item.conversion_factor || 1
  );

  // Calculate discount based on the total price
  const subtotal = quantity * price;
  const discountAmount = (subtotal * discount) / 100;
  const totalAmount = subtotal - discountAmount;

  const handleSave = () => {
    updateItem(item.item_code, quantity, price, discount);
    setOpen(false);
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
    setUom(item.uom);
    setWarehouse(item.warehouse);
    setConversionFactor(item.conversion_factor || 1);
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Edit</Button>}
      </DialogTrigger>

      {/* 📌 Bigger Dialog for Proper UI */}
      <DialogContent
        onKeyDown={handleKeyPress}
        className="max-w-xl p-8 rounded-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit {item.item_name}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Update the item's quantity, price, and discount.
          </p>
        </DialogHeader>

        {/* 📌 Quantity & Price */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <Input
              type="number"
              value={quantity}
              min={1}
              className="rounded-md"
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <Input
              type="number"
              value={price}
              className="rounded-md"
              onChange={(e) => setPrice(Number(e.target.value))}
              readOnly={!canEditItemPrice} // ✅ Disable if `allow_rate_change` is false
            />
          </div>
        </div>

        {/* 📌 Item Discount as Percentage */}
        {
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Item Discount (%)
            </label>
            <Input
              type="number"
              value={discount}
              min={0}
              max={100}
              className="rounded-md"
              onChange={(e) => setDiscount(Number(e.target.value))}
              readOnly={!canEditItemDiscount}
            />
          </div>
        }

        {/* 📌 Two-Column Additional Fields */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              UOM
            </label>
            <Input type="text" value={uom} disabled className="rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Conversion Factor
            </label>
            <Input
              type="number"
              value={conversionFactor}
              min={1}
              className="rounded-md"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Warehouse
            </label>
            <Input
              type="text"
              value={warehouse}
              disabled
              className="rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Available Stock
            </label>
            <Input
              type="number"
              value={item.stock_qty}
              disabled
              className="rounded-md"
            />
          </div>
        </div>

        {/* 📌 Total Amount (Styled) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Total Amount
          </label>
          <Input
            type="text"
            value={`$ ${totalAmount.toFixed(2)}`}
            disabled
            className="font-semibold text-gray-900 rounded-md"
          />
        </div>

        {/* 📌 Save Button */}
        <Button
          className="w-full mt-6 text-white bg-gray-900"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
