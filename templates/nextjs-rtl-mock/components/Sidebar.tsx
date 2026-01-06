import Link from "next/link";

const links = [
  { href: "/", label: "داشبورد" },
  { href: "/customers", label: "مشتریان" },
  { href: "/settings", label: "تنظیمات" },
  { href: "/about", label: "درباره" },
  { href: "/login", label: "ورود" }
];

export default function Sidebar() {
  return (
    <aside className="border-l border-slate-800 bg-slate-900/60 p-6">
      <h1 className="text-lg font-semibold mb-6">داشبورد نمونه</h1>
      <nav className="space-y-2 text-sm text-slate-300">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 hover:bg-slate-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
