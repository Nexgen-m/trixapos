import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { format } from "date-fns";
import { Package, Clock, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TopBar } from "@/components/layout/TopBar";
import { RejectedOrderCard } from "@/components/orders/RejectedOrderCard";

export const OrderScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { username } = useAuth();
  const {
    getDraftOrders,
    completedOrders,
    rejectedOrders,
    loadHeldOrder,
    removeHeldOrder,
    resendOrderEmail,
    syncOfflineOrders,
    heldOrders,
  } = usePOSStore();

  const { customer } = usePOSStore();
  const [heldOrderList, setHeldOrderList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("held");
  const [searchTerm, setSearchTerm] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    const fetchHeldOrders = async () => {
      try {
        const orders = await getDraftOrders();
        setHeldOrderList(orders);
      } catch (error) {
        console.error("Failed to fetch held orders", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchHeldOrders();
  }, [getDraftOrders]);

  // Listen for the "online" event to sync offline orders
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineOrders();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncOfflineOrders]);

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

  // Filter logic (unchanged)
  const filterOrders = (orders: any[]) => {
    const lowerSearch = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const itemMatch = order.items.some(
        (item: any) =>
          item.item_name.toLowerCase().includes(lowerSearch) ||
          item.item_code.toLowerCase().includes(lowerSearch)
      );
      let customerMatch = false;
      if (order.customer) {
        if (typeof order.customer === "string") {
          customerMatch = order.customer.toLowerCase().includes(lowerSearch);
        } else if (order.customer.customer_name) {
          customerMatch = order.customer.customer_name
            .toLowerCase()
            .includes(lowerSearch);
        }
      }
      return itemMatch || customerMatch;
    });
  };

  const filteredHeldOrders = filterOrders(heldOrderList);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        username={username}
        route={"/trixapos/OrderScreen"}
      />

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
                Held Orders ({heldOrderList.length})
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

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-screen px-10 mx-auto">
          {activeTab === "held" && (
            <>
              {loadingOrders ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Loading held orders...</p>
                </div>
              ) : filteredHeldOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No held orders found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHeldOrders.map((order) => (
                    <div key={order.id} className="relative">
                      {/* Display Order ID */}

                      <span className="absolute -top-[-8px] left-2 text-[14px] text-blue-600 font-bold">
                        {order.customer
                          ? typeof order.customer === "string"
                            ? order.customer
                            : order.customer.customer_name
                          : "Guest Customer"}
                      </span>
                      <div className="bg-white border-[1.2px] rounded-lg mt-6 hover:shadow-md transition-shadow border-blue-600 p-4 flex flex-col h-[244px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {format(
                              new Date(order.timestamp),
                              "MMM d, yyyy h:mm a"
                            )}
                          </div>
                          <div className="flex items-end gap-2 flex-col justify-start items-start">
                            <span className="font-medium">
                              ${order.total.toFixed(2)}
                            </span>
                            <span className=" text-[12px] text-gray-500">
                              ID: {order.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                          {order.items.slice(0, 3).map((item: any) => (
                            <div
                              key={item.item_code}
                              className="text-sm mb-1 last:mb-0"
                            >
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
                            onClick={() => {
                              removeHeldOrder(order.id);
                              setHeldOrderList((prev) =>
                                prev.filter((o) => o.id !== order.id)
                              );
                            }}
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeTab === "rejected" && (
            <>
              {rejectedOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No rejected orders found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedOrders.map((order) => (
                    <RejectedOrderCard
                      key={order.id}
                      order={order}
                      onLoadOrder={handleLoadOrder}
                      onRemoveOrder={(id) => {
                        // For rejected orders, you can simply remove from the store
                        removeHeldOrder(id);
                        setHeldOrderList((prev) =>
                          prev.filter((o) => o.id !== id)
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {/* You can add similar sections for "completed" tabs if needed */}
        </div>
      </div>
    </div>
  );
};
