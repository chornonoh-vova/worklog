import { Database } from "bun:sqlite";

const home = process.env.HOME;
const defaultPath = home ? `${home}/.worklog.db` : ".worklog.db";
const dbPath = process.env.WORKLOG_DB ?? defaultPath;

const db = new Database(dbPath);
db.run(`
        CREATE TABLE IF NOT EXISTS worklogs (
                date    TEXT PRIMARY KEY,
                summary TEXT NOT NULL
        );
`);

const selectStmt = db.query("SELECT summary FROM worklogs WHERE date = ?");
const upsertStmt = db.query("INSERT OR REPLACE INTO worklogs (date, summary) VALUES (?, ?)");

export function getCached(date: string): string | null {
        const row = selectStmt.get(date) as { summary: string } | null;
        return row?.summary ?? null;
}

export function setCached(date: string, summary: string): void {
        upsertStmt.run(date, summary);
}
