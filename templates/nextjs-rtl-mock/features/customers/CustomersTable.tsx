"use client";

import { useMemo, useState } from "react";
import { Customer, loadCustomers, saveCustomers } from "./data";

export default function CustomersTable({ showControls = false }: { showControls?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const stats = useMemo(() => {
    const active = customers.filter((c) => c.status === "active").length;
    return { total: customers.length, active };
  }, [customers]);

  const addCustomer = () => {
    if (!name || !email) return;
    const next = [
      ...customers,
      { id: crypto.randomUUID(), name, email, status: "active" as const }
    ];
    setCustomers(next);
    saveCustomers(next);
    setName("");
    setEmail("");
  };

  const toggleStatus = (id: string) => {
    const next = customers.map((customer) =>
      customer.id === id
        ? { ...customer, status: customer.status === "active" ? "inactive" : "active" }
        : customer
    );
    setCustomers(next);
    saveCustomers(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm text-slate-400">
        <span>کل مشتریان: {stats.total}</span>
        <span>فعال: {stats.active}</span>
      </div>
      {showControls && (
        <div className="grid md:grid-cols-3 gap-2">
          <input
            className="rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            placeholder="نام"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            placeholder="ایمیل"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="rounded-md bg-emerald-500" onClick={addCustomer}>
            افزودن مشتری
          </button>
        </div>
      )}
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="text-right py-2">نام</th>
              <th className="text-right py-2">ایمیل</th>
              <th className="text-right py-2">وضعیت</th>
              <th className="text-right py-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate-800">
                <td className="py-2">{customer.name}</td>
                <td className="py-2">{customer.email}</td>
                <td className="py-2">
                  <span
                    className={
                      customer.status === "active" ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {customer.status === "active" ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="py-2">
                  <button
                    className="text-xs border border-slate-700 px-2 py-1 rounded-md"
                    onClick={() => toggleStatus(customer.id)}
                  >
                    تغییر وضعیت
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
