import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item } from "../types/pos";
import {
  Package,
  Tag,
  Box,
  Warehouse,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemInfoDialogProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemInfoDialog({ item, isOpen, onClose }: ItemInfoDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!item) return null;

  // Combine single image and images array
  const allImages = [item.image, ...(item.images || [])].filter(
    (img): img is string => !!img
  );

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Item Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex">
          {/* Image Sidebar */}
          {allImages.length > 0 && (
            <div className="w-24 border-r border-gray-200 p-2 space-y-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-full aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedImageIndex === index
                      ? "border-blue-500 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${item.item_name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Main Image Section */}
              <div className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-6">
                {allImages.length > 0 ? (
                  <>
                    <img
                      src={allImages[selectedImageIndex]}
                      alt={item.item_name}
                      className="max-w-full max-h-full object-contain"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow-md text-gray-600 hover:text-gray-900 transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow-md text-gray-600 hover:text-gray-900 transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-semibold">
                    {item.item_name}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.item_name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {item.item_code}
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  {/* Price */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Price</div>
                    <div className="text-2xl font-bold text-blue-700">
                      ${item.price_list_rate.toFixed(2)}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Box className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Category</div>
                      <div className="font-medium">{item.item_group}</div>
                      <div className="text-sm text-gray-500">
                        {item.item_group}
                      </div>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Warehouse className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Stock Quantity
                      </div>
                      <div className="font-medium">{item.stock_qty} units</div>
                      <div className="text-sm text-gray-500">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            item.stock_qty > 20
                              ? "text-green-600"
                              : item.stock_qty > 5
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.stock_qty > 20
                            ? "In Stock"
                            : item.stock_qty > 5
                            ? "Low Stock"
                            : "Very Low"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="md:col-span-2 border-t pt-4">
                <h4 className="font-medium mb-2">Description</h4>
                <div
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: item.description || "" }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
