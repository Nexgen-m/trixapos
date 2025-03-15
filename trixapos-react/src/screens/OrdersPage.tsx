import { CustomerSelector } from "@/components/CustomerSelector";
import { ItemSearch } from "@/components/ItemSearch";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { useState } from "react";
import { DraftCard } from "@/components/ui/draftCard";



export const OrderPage = () => {

    const draftOrders = usePOSStore.getState().getDraftOrders();

    const [deleted, setDeleted] = useState<boolean>(false);

      const [searchTerm, setSearchTerm] = useState("");
    
      const handleItemSearch = (search: string) => {
        setSearchTerm(search);
      };
    
      const clearSearch = () => {
        setSearchTerm("");
      };

      const deleteDraft = (name: string) => {
        let d = deleted;
        usePOSStore.getState().deleteDraftOrder(name);
        setDeleted(!d);
    }
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
      {/* Search Bar and Customer Selector */}
      <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
        <div className="flex-1">
          <ItemSearch
            search={searchTerm}
            onSearch={handleItemSearch}
            onClear={clearSearch}
          />
        </div>
        <div className="w-80">
          <CustomerSelector />
        </div>
      </div>

      {/* Items Grid */}
        <div
            className="flex flex-row flex-wrap"
        >
            {draftOrders.map((draft) => (
              <DraftCard date={draft.date} name={draft.name} cart={draft.cart} total={draft.total} deleteDraft={deleteDraft} />
            ))}
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

}