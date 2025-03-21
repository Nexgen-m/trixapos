// src/components/RejectedOrderCard.tsx
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectedOrderCardProps {
  order: {
    id: string;
    timestamp: number;
    total: number;
    items: any[];
    note?: string;
    customer?: string | { customer_name: string };
  };
  onLoadOrder: (id: string) => void;
  onRemoveOrder: (id: string) => void;
}

export const RejectedOrderCard = ({
  order,
  onLoadOrder,
  onRemoveOrder,
}: RejectedOrderCardProps) => {
  return (
    <div className="relative bg-white border-[1.2px] rounded-lg mt-6 hover:shadow-md transition-shadow border-blue-600 p-4 flex flex-col min-h-[220px]">
      {/* Display Order ID */}
      <span className="absolute -top-6 left-2 text-xs text-gray-500">
        ID: {order.id}
      </span>
      <span className="absolute -top-4 left-2 text-[14px] text-blue-600 font-bold">
        {order.customer
          ? typeof order.customer === "string"
            ? order.customer
            : order.customer.customer_name
          : "Guest Customer"}
      </span>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {format(new Date(order.timestamp), "MMM d, yyyy h:mm a")}
        </div>
        <span className="font-medium">${order.total.toFixed(2)}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {order.items.slice(0, 3).map((item: any) => (
          <div key={item.item_code} className="text-sm mb-1 last:mb-0">
            {item.qty}x {item.item_name}
          </div>
        ))}
      </div>
      {order.note && (
        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
          Note: {order.note}
        </div>
      )}
      <div className="pt-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 mr-3 border-red-400"
          onClick={() => onRemoveOrder(order.id)}
        >
          Remove
        </Button>
        <Button size="sm" onClick={() => onLoadOrder(order.id)}>
          Load Order
        </Button>
      </div>
    </div>
  );
};
