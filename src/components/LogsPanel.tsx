export default function LogsPanel({ logs }: { logs: string[] }) {
  return (
    <section className="border-t border-slate-800 bg-slate-950/80 p-4 h-48 overflow-auto">
      <h2 className="text-sm text-slate-300 mb-2">لاگ‌ها</h2>
      <pre className="text-xs whitespace-pre-wrap text-slate-400">
        {logs.length === 0 ? "لاگی ثبت نشده است." : logs.join("\n")}
      </pre>
    </section>
  );
}
