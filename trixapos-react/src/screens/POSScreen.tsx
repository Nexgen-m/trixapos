import React from "react";
import { useProducts } from "../hooks/fetchers/useProducts";
import { ItemList } from "../components/ItemList";
import { Cart } from "../components/cart/Cart";
import { CustomerSelector } from "../components/CustomerSelector";

export function POSScreen() {
  const { items, loading, error } = useProducts();

  return (
    <div className="flex h-[calc(100vh-160px)]">
      <ItemList items={items} loading={loading} error={error} />
      <div className="w-96 flex flex-col">
        <CustomerSelector />
        <Cart />
      </div>
    </div>
  );
}
