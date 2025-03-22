// src/lib/fetchWithCredentials.ts

export async function fetchWithCredentials(url: string, params?: Record<string, any>) {
    const query = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
  
    const response = await fetch(`/api/method/${url}${query}`, {
      method: "GET",
      credentials: "include", // This ensures cookies like sessionid are sent
      headers: {
        "Accept": "application/json",
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || "API call failed");
    }
  
    return data.message || data; // Match how frappe-js-sdk usually returns
  }
  