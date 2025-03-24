// import { Invoice } from "@/hooks/Stores/usePOSStore";
import { openDB } from "idb";

// Open IndexedDB database
export const dbPromise = openDB("trixapos", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("held_orders")) {
      db.createObjectStore("held_orders", {
        keyPath: "id",
        autoIncrement: false, // Use our provided id as key
      });
    }
    if (!db.objectStoreNames.contains("offline_invoices")) {
      db.createObjectStore("offline_invoices", {
      keyPath: "id",
      autoIncrement: false, // Use our provided id as key
      });
    }
  },
});

// Save order to IndexedDB using put (to allow replacing if needed)
export async function saveOrderOffline(order: any) {
  const db = await dbPromise;
  await db.put("held_orders", order);
}

// Fetch all offline orders
export async function getOfflineOrders() {
  const db = await dbPromise;
  return db.getAll("held_orders");
}

// Delete an order from IndexedDB by its id
export async function removeOfflineOrder(id: any) {
  const db = await dbPromise;
  await db.delete("held_orders", id);
}

// lib/db.ts
export const saveInvoiceOffline = async (invoice: any) => {
  // Save to IndexedDB
  const db = await dbPromise;
  await db.put("offline_invoices", invoice);
};

export const updateInvoiceOffline = async (invoice: any) => {
  // Update in IndexedDB
};

export const deleteInvoiceOffline = async (id: string): Promise<void> => {
  // Delete from IndexedDB
};

export async function getInvoicesOffline() {
  // Retrieve from IndexedDB
  const db = await dbPromise;
  return db.getAll("offline_invoices");
  // return [];
};
