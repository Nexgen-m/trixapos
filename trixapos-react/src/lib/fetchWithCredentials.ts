export async function fetchWithCredentials(
  url: string,
  params?: Record<string, any>
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
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API call failed");
  }

  return data.message || data; // Match how frappe-js-sdk usually returns
}
