// src/lib/createDraftOrder.ts

import { postWithCredentials } from "./postWithCredentials";

export async function createDraftOrder(orderPayload: Record<string, any>) {
  try {
    // Convert the payload to a JSON string as expected by the backend
    const payload = JSON.stringify(orderPayload);

    // Send the request to the backend
    const response = await postWithCredentials(
      "trixapos.api.sales_order.create_draft_sales_order",
      { data: payload } // Wrap the payload in a "data" key
    );

    return response;
  } catch (error) {
    console.error("Failed to create draft order:", error);
    throw error;
  }
}
