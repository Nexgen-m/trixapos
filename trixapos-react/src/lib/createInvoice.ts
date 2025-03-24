// src/lib/createDraftOrder.ts

import { postWithCredentials } from "./postWithCredentials";

export async function createInvoice(invoicePayload: Record<string, any>) {
  try {
    // Convert the payload to a JSON string as expected by the backend
    const payload = JSON.stringify(invoicePayload);

    // Send the request to the backend
    const response = await postWithCredentials(
      "trixapos.api.sales_invoice.create_sales_invoice",
      { data: payload } // Wrap the payload in a "data" key
    );

    return response;
  } catch (error) {
    console.error("Failed to create invoice:", error);
    throw error;
  }
}
