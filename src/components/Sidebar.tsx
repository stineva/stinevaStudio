import { useMemo, useState } from "react";
import { Project, PromptHistory } from "../types";

type Props = {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onOpenProject: () => void;
  fileTree: { path: string; type: "file" | "dir" }[];
  promptHistory: PromptHistory[];
  onRollback: () => void;
};

export default function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onOpenProject,
  fileTree,
  promptHistory,
  onRollback
}: Props) {
  const [newProjectName, setNewProjectName] = useState("");

  const groupedTree = useMemo(() => {
    return fileTree.filter((item) => item.type === "file").slice(0, 40);
  }, [fileTree]);

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4 overflow-y-auto">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">پروژه‌ها</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm"
            placeholder="نام پروژه جدید"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
          />
          <button
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm"
            onClick={() => {
              if (!newProjectName.trim()) return;
              onCreateProject(newProjectName.trim());
              setNewProjectName("");
            }}
          >
            ایجاد
          </button>
        </div>
        <button
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm"
          onClick={onOpenProject}
        >
          باز کردن پروژه موجود
        </button>
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full text-right rounded-md px-3 py-2 text-sm border transition ${
                currentProject?.id === project.id
                  ? "bg-slate-800 border-indigo-400"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
        <button
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300"
          onClick={onRollback}
        >
          بازگشت به آخرین نسخه موفق
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300">درخت فایل</h2>
        <ul className="text-xs text-slate-400 space-y-1">
          {groupedTree.map((item) => (
            <li key={item.path} className="truncate">
              {item.path}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300">تاریخچه پرامپت‌ها</h2>
        <ul className="text-xs text-slate-400 space-y-1">
          {promptHistory.map((item) => (
            <li key={`${item.createdAt}-${item.prompt}`}>
              <span className={item.success ? "text-emerald-400" : "text-rose-400"}>●</span>{" "}
              {item.prompt.slice(0, 40)}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
