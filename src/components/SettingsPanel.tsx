import { useEffect, useState } from "react";
import { Settings } from "../types";

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
};

export default function SettingsPanel({ settings, onSave }: Props) {
  const [local, setLocal] = useState(settings);
  const [models, setModels] = useState<{ name: string }[]>([]);
  const [health, setHealth] = useState<null | boolean>(null);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const loadModels = async () => {
    const data = await window.studio.listModels(local.baseUrl);
    setModels(data);
  };

  const check = async () => {
    const ok = await window.studio.checkHealth(local.baseUrl);
    setHealth(ok);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-slate-300">آدرس اولاما</label>
          <input
            className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            value={local.baseUrl}
            onChange={(event) => setLocal({ ...local, baseUrl: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-slate-300">مدل</label>
          <select
            className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            value={local.model}
            onChange={(event) => setLocal({ ...local, model: event.target.value })}
          >
            <option value="">انتخاب مدل</option>
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="border border-slate-700 px-3 py-2 rounded-md" onClick={loadModels}>
              دریافت مدل‌ها
            </button>
            <button className="border border-slate-700 px-3 py-2 rounded-md" onClick={check}>
              تست اتصال
            </button>
            {health !== null && (
              <span className={health ? "text-emerald-400" : "text-rose-400"}>
                {health ? "سالم" : "قطع"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-slate-300">دما</label>
          <input
            type="number"
            className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            value={local.temperature}
            onChange={(event) => setLocal({ ...local, temperature: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-slate-300">top_p</label>
          <input
            type="number"
            className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            value={local.topP}
            onChange={(event) => setLocal({ ...local, topP: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-slate-300">max_tokens</label>
          <input
            type="number"
            className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
            value={local.maxTokens}
            onChange={(event) => setLocal({ ...local, maxTokens: Number(event.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-slate-200 font-semibold">تمپلیت پرامپت‌ها</h3>
        <div className="space-y-2">
          <label className="text-slate-300">Planner</label>
          <textarea
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-3 text-xs min-h-[120px]"
            value={local.planner}
            onChange={(event) => setLocal({ ...local, planner: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-slate-300">Patcher</label>
          <textarea
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-3 text-xs min-h-[120px]"
            value={local.patcher}
            onChange={(event) => setLocal({ ...local, patcher: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-slate-300">Fixer</label>
          <textarea
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-3 text-xs min-h-[120px]"
            value={local.fixer}
            onChange={(event) => setLocal({ ...local, fixer: event.target.value })}
          />
        </div>
      </div>

      <button className="rounded-md bg-indigo-500 px-4 py-2" onClick={() => onSave(local)}>
        ذخیره تنظیمات
      </button>
    </div>
  );
}
