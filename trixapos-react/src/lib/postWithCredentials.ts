// src/lib/postWithCredentials.ts

export async function postWithCredentials(
  url: string,
  data: Record<string, any>
) {
  const response = await fetch(`/api/method/${url}`, {
    method: "POST",
    credentials: "include", // This ensures cookies like sessionid are sent
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data), // Send the payload as a JSON string
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "API call failed");
  }

  return responseData.message || responseData; // Match how frappe-js-sdk usually returns
}
