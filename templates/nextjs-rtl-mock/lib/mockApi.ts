import { Customer, loadCustomers, saveCustomers } from "../features/customers/data";

export const mockApi = {
  listCustomers(): Customer[] {
    return loadCustomers();
  },
  addCustomer(customer: Customer): Customer[] {
    const current = loadCustomers();
    const next = [...current, customer];
    saveCustomers(next);
    return next;
  }
};
