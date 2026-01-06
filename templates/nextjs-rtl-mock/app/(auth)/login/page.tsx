export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto card space-y-4">
      <h1 className="text-xl font-semibold">ورود</h1>
      <p className="text-sm text-slate-400">احراز هویت نمایشی برای نمونه.</p>
      <form className="space-y-3">
        <input className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2" placeholder="ایمیل" />
        <input
          className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
          placeholder="رمز عبور"
          type="password"
        />
        <button type="button" className="w-full rounded-md bg-indigo-500 py-2">
          ورود آزمایشی
        </button>
      </form>
    </div>
  );
}
