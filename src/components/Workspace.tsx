import { ReactNode, useState } from "react";

const tabs = [
  { id: "plan", label: "برنامه" },
  { id: "diff", label: "پچ" },
  { id: "settings", label: "تنظیمات" }
] as const;

type Props = {
  running: boolean;
  planOutput: string;
  patchOutput: string;
  onRun: (prompt: string, dryRun: boolean) => void;
  activeTab: "plan" | "diff" | "settings";
  onChangeTab: (tab: "plan" | "diff" | "settings") => void;
  children?: ReactNode;
};

export default function Workspace({
  running,
  planOutput,
  patchOutput,
  onRun,
  activeTab,
  onChangeTab,
  children
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [dryRun, setDryRun] = useState(false);

  return (
    <section className="flex flex-col p-6 gap-4 overflow-hidden">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <label className="text-sm text-slate-300">پرامپت</label>
        <textarea
          className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm min-h-[140px]"
          placeholder="ویژگی جدید را توضیح دهید..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(event) => setDryRun(event.target.checked)}
            />
            اجرای خشک (فقط برنامه و پچ)
          </label>
          <button
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm"
            disabled={running}
            onClick={() => onRun(prompt, dryRun)}
          >
            {running ? "در حال اجرا..." : "اجرا"}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`rounded-md px-3 py-2 text-sm border ${
              activeTab === tab.id
                ? "border-indigo-400 bg-slate-800"
                : "border-slate-800 text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-900/40 p-4">
        {activeTab === "plan" && (
          <pre className="text-xs whitespace-pre-wrap text-slate-200">{planOutput}</pre>
        )}
        {activeTab === "diff" && (
          <pre className="text-xs whitespace-pre-wrap text-slate-200">{patchOutput}</pre>
        )}
        {activeTab === "settings" && children}
      </div>
    </section>
  );
}
