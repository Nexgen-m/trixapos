import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Customer } from '../../types/pos';

/**
 * Fetch customers from Frappe API.
 */
export const useCustomers = () => {
  return useFrappeGetDocList<Customer>('Customer', {
    fields: ['name', 'customer_name'], // Removed `email` & `phone` to avoid 417 error
    limit: 50,
  });
};
