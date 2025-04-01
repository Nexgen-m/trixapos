export async function fetchWithCredentials(
  url: string,
  params?: Record<string, any>,
  options?: { responseType?: string }
) {
  // Check if the URL is absolute (starts with http:// or https://)
  const isAbsoluteUrl = /^https?:\/\//i.test(url);

  // Construct the full URL
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const fullUrl = isAbsoluteUrl
    ? `${url}${query}`
    : `/api/method/${url}${query}`;

  const response = await fetch(fullUrl, {
    method: "GET",
    credentials: "include", // This ensures cookies like sessionid are sent
    headers: {
      Accept: "application/json", // Default header
    },
  });

  // Handle responseType
  if (options?.responseType === "blob") {
    // Return the binary data for blobs
    if (!response.ok) {
      const errorText = await response.text(); // Extract error message for debugging
      throw new Error(errorText || "Failed to fetch binary data");
    }
    return response.blob(); // Return the blob for PDFs
  }

  // Default behavior: parse JSON
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API call failed");
  }

  return data.message || data; // Match how frappe-js-sdk usually returns
}