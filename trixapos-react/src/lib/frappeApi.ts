// src/lib/frappeApi.ts
import { frappe } from "./frappe"; // your existing frappe instance

// Wrap frappe.call and bypass type errors.
export const callFn = (params: { method: string; args?: object }) => {
  return (frappe.call as any)(params);
};

// Helper function that takes a method string and optional args.
export const fetchFromFrappe = async (
  method: string,
  options: { args?: object } = {}
) => {
  const result = await callFn({ method, args: options.args });
  return result.message || result;
};

