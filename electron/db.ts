import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { app } from "electron";

export type ProjectRecord = {
  id: string;
  name: string;
  path: string;
  lastOpenedAt: string;
  lastSuccessCommit?: string | null;
};

export type ExecutionRecord = {
  id: string;
  projectId: string;
  prompt: string;
  plan: string;
  patch: string;
  logs: string;
  success: number;
  createdAt: string;
};

export type SettingsRecord = {
  id: string;
  key: string;
  value: string;
};

let db: Database.Database;

export function getDb() {
  if (db) return db;
  const dir = app.getPath("userData");
  fs.mkdirSync(dir, { recursive: true });
  const dbPath = path.join(dir, "studio.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    create table if not exists projects (
      id text primary key,
      name text not null,
      path text not null,
      lastOpenedAt text not null,
      lastSuccessCommit text
    );
    create table if not exists executions (
      id text primary key,
      projectId text not null,
      prompt text not null,
      plan text,
      patch text,
      logs text,
      success integer not null,
      createdAt text not null
    );
    create table if not exists settings (
      id text primary key,
      key text unique not null,
      value text not null
    );
  `);
  return db;
}

export function getSetting(key: string): string | null {
  const row = getDb().prepare("select value from settings where key = ?").get(key);
  return row?.value ?? null;
}

export function setSetting(key: string, value: string) {
  const db = getDb();
  const existing = db.prepare("select id from settings where key = ?").get(key) as
    | { id: string }
    | undefined;
  if (existing) {
    db.prepare("update settings set value = ? where key = ?").run(value, key);
  } else {
    db.prepare("insert into settings (id, key, value) values (?, ?, ?)").run(
      crypto.randomUUID(),
      key,
      value
    );
  }
}

export function upsertProject(project: ProjectRecord) {
  getDb()
    .prepare(
      "insert into projects (id, name, path, lastOpenedAt, lastSuccessCommit) values (?, ?, ?, ?, ?) on conflict(id) do update set name=excluded.name, path=excluded.path, lastOpenedAt=excluded.lastOpenedAt, lastSuccessCommit=excluded.lastSuccessCommit"
    )
    .run(
      project.id,
      project.name,
      project.path,
      project.lastOpenedAt,
      project.lastSuccessCommit ?? null
    );
}

export function listProjects(): ProjectRecord[] {
  return getDb()
    .prepare("select * from projects order by lastOpenedAt desc limit 20")
    .all() as ProjectRecord[];
}

export function addExecution(execution: ExecutionRecord) {
  getDb()
    .prepare(
      "insert into executions (id, projectId, prompt, plan, patch, logs, success, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      execution.id,
      execution.projectId,
      execution.prompt,
      execution.plan,
      execution.patch,
      execution.logs,
      execution.success,
      execution.createdAt
    );
}

export function listPrompts(projectId: string) {
  return getDb()
    .prepare(
      "select prompt, createdAt, success from executions where projectId = ? order by createdAt desc limit 25"
    )
    .all(projectId) as { prompt: string; createdAt: string; success: number }[];
}
