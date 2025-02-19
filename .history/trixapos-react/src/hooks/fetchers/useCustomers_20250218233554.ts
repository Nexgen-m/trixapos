import { useQuery } from "@tanstack/react-query";

export interface Customer {
  name: string;
  customer_name: string;
}

export function useCustomers() {
  return useQuery<Customer[], Error>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/method/nexapos.api.get_customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      return data.message || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });
}
