export type Customer = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
};

const STORAGE_KEY = "mock_customers";

export const defaultCustomers: Customer[] = [
  { id: "c1", name: "آرمان کریمی", email: "arman@example.com", status: "active" },
  { id: "c2", name: "پریسا نادری", email: "parisa@example.com", status: "active" },
  { id: "c3", name: "علیرضا ملکی", email: "alireza@example.com", status: "inactive" }
];

export function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return defaultCustomers;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCustomers));
    return defaultCustomers;
  }
  try {
    return JSON.parse(raw) as Customer[];
  } catch {
    return defaultCustomers;
  }
}

export function saveCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}
