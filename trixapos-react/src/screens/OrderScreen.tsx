import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { format } from "date-fns";
import {
  Package,
  Clock,
  ArrowLeft,
  Mail,
  Printer,
  Trash2,
  Search,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TopBar } from "@/components/layout/TopBar";

export const OrderScreen = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { username, authLoading } = useAuth();

  const {
    heldOrders,
    completedOrders,
    rejectedOrders,
    loadHeldOrder,
    removeHeldOrder,
    resendOrderEmail,
  } = usePOSStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("held");
  const [searchTerm, setSearchTerm] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadOrder = (id: string) => {
    loadHeldOrder(id);
    navigate("/");
  };

  const handleResendEmail = async (orderId: string) => {
    if (!emailAddress) return;
    setIsLoading(true);
    try {
      await resendOrderEmail(orderId, emailAddress);
      setEmailAddress("");
      setSelectedOrderId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search term
  const filterOrders = (orders: any[]) =>
    orders.filter((order) =>
      order.items.some(
        (item: any) =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const filteredHeldOrders = filterOrders(heldOrders);
  const filteredCompletedOrders = filterOrders(completedOrders);
  const filteredRejectedOrders = filterOrders(rejectedOrders);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        username={username}
        route={"/trixapos/OrderScreen"}
      />

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            className="pl-10"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full p-0 h-12 bg-transparent">
              <TabsTrigger
                value="held"
                className="flex-1 h-full data-[state=active]:bg-gray-50 rounded-none border-b-2 data-[state=active]:border-blue-600"
              >
                Held Orders ({heldOrders.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 h-full data-[state=active]:bg-gray-50 rounded-none border-b-2 data-[state=active]:border-blue-600"
              >
                Completed ({completedOrders.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex-1 h-full data-[state=active]:bg-gray-50 rounded-none border-b-2 data-[state=active]:border-blue-600"
              >
                Rejected ({rejectedOrders.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-screen px-10 mx-auto">
          {/* Held Orders */}
          {activeTab === "held" && (
            <div className="space-y-4">
              {filteredHeldOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No held orders found</p>
                </div>
              ) : (
                filteredHeldOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border-[1.2px] rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow border-blue-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {format(
                          new Date(order.timestamp),
                          "MMM d, yyyy h:mm a"
                        )}
                      </div>
                      <span className="font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.item_code} className="text-sm">
                          {item.qty}x {item.item_name}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 pt-4">
                      Guest Customer
                    </div>
                    {order.note && (
                      <div className="text-sm bg-gray-50 p-2 pt-0 rounded">
                        Note: {order.note}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 mr-3 border-red-400"
                        onClick={() => removeHeldOrder(order.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLoadOrder(order.id)}
                      >
                        Load Order
                      </Button>
                      <div className="float-right ml-[40%] text-sm text-gray-500 pt-4 -mt-2">
                        {order.id}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Completed Orders */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              {filteredCompletedOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No completed orders found</p>
                </div>
              ) : (
                filteredCompletedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {format(
                          new Date(order.timestamp),
                          "MMM d, yyyy h:mm a"
                        )}
                      </div>
                      <span className="font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.item_code} className="text-sm">
                          {item.qty}x {item.item_name}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Paid with: {order.paymentMethod}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Reprint
                      </Button>
                      {selectedOrderId === order.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            size="sm"
                            type="email"
                            placeholder="Enter email address"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                          />
                          <Button
                            size="sm"
                            disabled={!emailAddress || isLoading}
                            onClick={() => handleResendEmail(order.id)}
                          >
                            Send
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Rejected Orders */}
          {activeTab === "rejected" && (
            <div className="space-y-4">
              {filteredRejectedOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <XCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No rejected orders found</p>
                </div>
              ) : (
                filteredRejectedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-red-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {format(
                          new Date(order.timestamp),
                          "MMM d, yyyy h:mm a"
                        )}
                      </div>
                      <span className="font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.item_code} className="text-sm">
                          {item.qty}x {item.item_name}
                        </div>
                      ))}
                    </div>
                    {/* Rejection Reason */}
                    <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-700">
                          Rejection Reason
                        </div>
                        <p className="text-sm text-red-600">{order.reason}</p>
                        {order.rejectedBy && (
                          <p className="text-xs text-red-500 mt-1">
                            Rejected by: {order.rejectedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Customer Info */}
                    {order.customer && (
                      <div className="text-sm text-gray-500">
                        Customer: {order.customer.customer_name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
