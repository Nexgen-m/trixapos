import { openDB } from "idb";

// Open IndexedDB database
export const dbPromise = openDB("trixapos", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("held_orders")) {
      db.createObjectStore("held_orders", {
        keyPath: "id",
        autoIncrement: false, // Use our provided id as key
      });
    }
  },
});

// Save order to IndexedDB using put (to allow replacing if needed)
export async function saveOrderOffline(order) {
  const db = await dbPromise;
  await db.put("held_orders", order);
}

// Fetch all offline orders
export async function getOfflineOrders() {
  const db = await dbPromise;
  return db.getAll("held_orders");
}

// Delete an order from IndexedDB by its id
export async function removeOfflineOrder(id) {
  const db = await dbPromise;
  await db.delete("held_orders", id);
}
