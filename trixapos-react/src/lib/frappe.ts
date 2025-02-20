import { FrappeApp } from 'frappe-js-sdk';

// Initialize FrappeApp with the backend URL
const frappe = new FrappeApp(import.meta.env.VITE_FRAPPE_BASE_URL);

// Exporting Frappe SDK methods for global use
export const db = frappe.db();       // For direct DB operations
export const auth = frappe.auth();   // For authentication operations
export const call = frappe.call();   // For calling custom Frappe methods
