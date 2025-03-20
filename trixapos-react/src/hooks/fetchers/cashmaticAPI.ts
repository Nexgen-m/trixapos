import { useFrappeGetCall } from "frappe-react-sdk";

export function useCashmaticData() {
    const { data, error, isLoading } = useFrappeGetCall(
      "frappe.client.get_list", 
      {
        doctype: "Cashmatic Gateway",
        fields: ["username", "password", "ip", "port"],
      }
    );
  
    if (error) {
      console.error("❌ Error Fetching DocType Data:", error);
    }
  
    // Extract first entry as an object instead of an array
    const cashmaticData = data?.message?.[0] || {}; 
    const hasData = Boolean(Object.keys(cashmaticData).length); 
  
    return {
      cashmaticData,
      hasData,
      isLoading,
      error,
    };
  }
  