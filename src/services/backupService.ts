import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getDB, initDB } from '../database/db';
import type { Category } from './categoryService';

type BackupTransaction = {
  id: number;
  amount: number;
  date: number;
  note: string | null;
  category_id: number;
};

type BackupPayload = {
  version: 1;
  exportedAt: number;
  categories: Category[];
  transactions: BackupTransaction[];
};

type ExportBackupResult = {
  fileUri: string;
  shared: boolean;
};

function isValidPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<BackupPayload>;
  return Array.isArray(payload.categories) && Array.isArray(payload.transactions);
}

export async function exportDatabaseToJson(): Promise<ExportBackupResult> {
  await initDB();
  const db = await getDB();

  const categories = await db.getAllAsync<Category>(
    `SELECT id, name, type, icon
     FROM Categories
     ORDER BY id ASC;`
  );

  const transactions = await db.getAllAsync<BackupTransaction>(
    `SELECT id, amount, date, note, category_id
     FROM Transactions
     ORDER BY date DESC, id DESC;`
  );

  const payload: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    categories,
    transactions,
  };

  const json = JSON.stringify(payload, null, 2);
  const backupFile = new File(Paths.cache, `finanzas-backup-${Date.now()}.json`);
  backupFile.create({ overwrite: true, intermediates: true });
  backupFile.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return {
      fileUri: backupFile.uri,
      shared: false,
    };
  }

  await Sharing.shareAsync(backupFile.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar copia de seguridad',
  });

  return {
    fileUri: backupFile.uri,
    shared: true,
  };
}

export async function importDatabaseFromJson(uri: string): Promise<void> {
  await initDB();
  const db = await getDB();

  const inputFile = new File(uri);
  const rawJson = await inputFile.text();

  const parsed: unknown = JSON.parse(rawJson);
  if (!isValidPayload(parsed)) {
    throw new Error('El archivo de respaldo no tiene el formato esperado.');
  }

  const { categories, transactions } = parsed;

  await db.execAsync('BEGIN TRANSACTION;');

  try {
    await db.runAsync('DELETE FROM Transactions;');
    await db.runAsync('DELETE FROM Categories;');

    for (const category of categories) {
      await db.runAsync(
        `INSERT INTO Categories (id, name, type, icon)
         VALUES (?, ?, ?, ?);`,
        category.id,
        category.name,
        category.type,
        category.icon
      );
    }

    for (const transaction of transactions) {
      await db.runAsync(
        `INSERT INTO Transactions (id, amount, date, note, category_id)
         VALUES (?, ?, ?, ?, ?);`,
        transaction.id,
        transaction.amount,
        transaction.date,
        transaction.note,
        transaction.category_id
      );
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}
