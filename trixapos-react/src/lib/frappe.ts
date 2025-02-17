import { FrappeApp } from 'frappe-js-sdk';

const frappe = new FrappeApp();

export const db = frappe.db();
export const auth = frappe.auth();
export const call = frappe.call();