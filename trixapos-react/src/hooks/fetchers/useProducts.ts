import { useState, useEffect } from "react";
import { Item } from "../../types/pos";

export function useProducts() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch("/api/method/nexapos.api.item_api.get_items");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // ✅ Ensure API response is properly formatted
        if (Array.isArray(data.message)) {
          setItems(data.message);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError("Error fetching items");
        console.error("Error fetching items:", err);
        setItems([]); // ✅ Ensure items is always an array
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  return { items, loading, error };
}
