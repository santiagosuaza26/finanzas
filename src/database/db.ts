import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
	if (!dbPromise) {
		dbPromise = SQLite.openDatabaseAsync('finanzas.db');
	}
	return dbPromise;
}

export async function initDB(): Promise<void> {
	const db = await getDB();

	await db.execAsync('PRAGMA journal_mode = WAL;');
	await db.execAsync('PRAGMA foreign_keys = ON;');

	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS Categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
			icon TEXT
		);

		CREATE TABLE IF NOT EXISTS Transactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			amount REAL NOT NULL,
			date INTEGER NOT NULL,
			note TEXT,
			category_id INTEGER NOT NULL,
			FOREIGN KEY (category_id) REFERENCES Categories(id)
		);
	`);
}
