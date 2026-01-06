export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">درباره ما</h1>
      <p className="text-slate-400">
        این قالب برای پروژه‌های نمونه با داده‌های ساختگی طراحی شده است و تمام اجزا قابل توسعه هستند.
      </p>
      <div className="card">
        <h2 className="text-lg font-semibold">اهداف پروژه</h2>
        <ul className="list-disc pr-6 text-slate-400 space-y-1">
          <li>توسعه سریع رابط‌های کاربری RTL</li>
          <li>مدیریت ساده داده‌های آزمایشی</li>
          <li>ساختار ماژولار و قابل توسعه</li>
        </ul>
      </div>
    </div>
  );
}
