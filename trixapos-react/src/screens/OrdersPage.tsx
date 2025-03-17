import { CustomerSelector } from "@/components/CustomerSelector";
import { ItemSearch } from "@/components/ItemSearch";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { useState } from "react";
import { DraftCard } from "@/components/ui/draftCard";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const OrderPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { username, authLoading } = useAuth();

  // const [customer, setCustomer] = useState(usePOSStore.getState().customer?.customer_name);
  // const [customer, setCustomer] = useState("West View Software Ltd.");
  // const draftOrders = usePOSStore.getState().getDraftOrders().filter((draft) => draft.customer == customer);
  const draftOrders = usePOSStore.getState().getDraftOrders();

  const [deleted, setDeleted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("held");

  // const [searchTerm, setSearchTerm] = useState("");

  // const handleItemSearch = (search: string) => {
  //   setSearchTerm(search);
  // };

  // const clearSearch = () => {
  //   setSearchTerm("");
  // };

  const deleteDraft = (name: string) => {
    let d = deleted;
    usePOSStore.getState().deleteDraftOrder(name);
    setDeleted(!d);
  };
  return (
    //   <div>
    //     <h2>Draft Orders</h2>
    //     {draftOrders.map((draft) => (
    //       <div key={draft.name}>
    //         <span>{draft.name}</span>
    //         <button onClick={() => usePOSStore.getState().restoreDraftOrder(draft.name)}>Restore</button>
    //         <button onClick={() => usePOSStore.getState().deleteDraftOrder(draft.name)}>Delete</button>
    //       </div>
    //     ))}
    //   </div>

    <div className="h-full flex flex-col">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        username={username}
        route={"/trixapos/OrderPage"}
      />
      {/* Search Bar and Customer Selector */}
      <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
        {/* <div className="flex-1">
          <ItemSearch
            search={searchTerm}
            onSearch={handleItemSearch}
            onClear={clearSearch}
          />
        </div> */}
        {/* <div className="w-auto text-xl ml-5 font-[600] mt-1">
          {customer}
        </div> */}
        {/* <div className="w-80 ml-auto mr-10">
          <CustomerSelector />
        </div> */}
      </div>

      {/* Items Grid */}
      {/* <div
            className="flex flex-row flex-wrap"
        >
            {draftOrders.map((draft) => (
              <DraftCard date={draft.date} name={draft.name} cart={draft.cart} total={draft.total} deleteDraft={deleteDraft} customer={draft.customer}/>
            ))}
        </div> */}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.item_code} className="text-sm">
                          {item.qty}x {item.item_name}
                        </div>
                      ))}
                    </div>

                    {order.note && (
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        Note: {order.note}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
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

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.item_code} className="text-sm">
                          {item.qty}x {item.item_name}
                        </div>
                      ))}
                    </div>

                    {/* Payment Method */}
                    <div className="text-sm text-gray-500">
                      Paid with: {order.paymentMethod}
                    </div>

                    {/* Actions */}
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

                    {/* Items */}
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

                    {/* Customer Info if available */}
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

      {/* {draftOrders.map((draft) => (

        <draftCard date={draft.date} name={draft.name} cart={draft.cart} total={draft.total}} />

      <div key={draft.name}>
        <span>{draft.name}</span>
        <button onClick={() => usePOSStore.getState().restoreDraftOrder(draft.name)}>Restore</button>
        <button onClick={() => usePOSStore.getState().deleteDraftOrder(draft.name)}>Delete</button>
      </div>
    ))} */}
    </div>
  );
};
