"use client";

import { useState } from "react";

export default function SettingsForm() {
  const [companyName, setCompanyName] = useState("استودیو نمونه");
  const [theme, setTheme] = useState("dark");

  return (
    <form className="card space-y-4">
      <div>
        <label className="text-sm text-slate-300">نام شرکت</label>
        <input
          className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">تم</label>
        <select
          className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          <option value="dark">تیره</option>
          <option value="light">روشن</option>
        </select>
      </div>
      <button type="button" className="rounded-md bg-indigo-500 px-4 py-2">
        ذخیره تنظیمات نمایشی
      </button>
    </form>
  );
}
