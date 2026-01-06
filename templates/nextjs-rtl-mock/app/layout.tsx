import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "پروژه نمونه",
  description: "قالب پیش‌فرض راست به چپ"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-slate-950 text-slate-100">
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
          <Sidebar />
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
