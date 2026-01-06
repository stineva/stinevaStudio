import CustomersTable from "../features/customers/CustomersTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">داشبورد</h1>
        <p className="text-slate-400">نمای کلی وضعیت فروش و مشتریان.</p>
      </header>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="text-sm text-slate-400">درآمد ماه</h2>
          <p className="text-xl font-semibold">۱۲۵٬۰۰۰٬۰۰۰ ریال</p>
        </div>
        <div className="card">
          <h2 className="text-sm text-slate-400">مشتریان فعال</h2>
          <p className="text-xl font-semibold">۲۴۳</p>
        </div>
        <div className="card">
          <h2 className="text-sm text-slate-400">درخواست‌های جدید</h2>
          <p className="text-xl font-semibold">۱۲</p>
        </div>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">مشتریان اخیر</h2>
        <CustomersTable />
      </section>
    </div>
  );
}
