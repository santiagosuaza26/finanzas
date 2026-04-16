import { getDB, initDB } from '../database/db';

export type TransactionWithCategory = {
  id: number;
  amount: number;
  date: number;
  note: string | null;
  category_id: number;
  category_name: string;
  category_type: string;
  category_icon: string | null;
};

export async function addTransaction(
  monto: number,
  fecha: number,
  nota: string | null,
  idCategoria: number
): Promise<number> {
  await initDB();
  const db = await getDB();

  const result = await db.runAsync(
    `INSERT INTO Transactions (amount, date, note, category_id)
     VALUES (?, ?, ?, ?);`,
    monto,
    fecha,
    nota,
    idCategoria
  );

  return Number(result.lastInsertRowId);
}

export async function getTransactions(
  startDate?: number,
  endDate?: number
): Promise<TransactionWithCategory[]> {
  await initDB();
  const db = await getDB();

  const queryParams: number[] = [];
  const hasDateRange = typeof startDate === 'number' && typeof endDate === 'number';

  const dateWhereClause = hasDateRange
    ? 'WHERE t.date >= ? AND t.date <= ?'
    : '';

  if (hasDateRange) {
    queryParams.push(startDate, endDate);
  }

  const rows = await db.getAllAsync<TransactionWithCategory>(
    `SELECT
      t.id,
      t.amount,
      t.date,
      t.note,
      t.category_id,
      c.name AS category_name,
      c.type AS category_type,
      c.icon AS category_icon
    FROM Transactions t
    INNER JOIN Categories c ON c.id = t.category_id
    ${dateWhereClause}
    ORDER BY t.date DESC, t.id DESC;`,
    ...queryParams
  );

  return rows;
}

export async function getTransactionById(transactionId: number): Promise<TransactionWithCategory | null> {
  await initDB();
  const db = await getDB();

  const row = await db.getFirstAsync<TransactionWithCategory>(
    `SELECT
      t.id,
      t.amount,
      t.date,
      t.note,
      t.category_id,
      c.name AS category_name,
      c.type AS category_type,
      c.icon AS category_icon
    FROM Transactions t
    INNER JOIN Categories c ON c.id = t.category_id
    WHERE t.id = ?;`,
    transactionId
  );

  return row ?? null;
}

export async function updateTransaction(
  transactionId: number,
  monto: number,
  fecha: number,
  nota: string | null,
  idCategoria: number
): Promise<void> {
  await initDB();
  const db = await getDB();

  await db.runAsync(
    `UPDATE Transactions
     SET amount = ?, date = ?, note = ?, category_id = ?
     WHERE id = ?;`,
    monto,
    fecha,
    nota,
    idCategoria,
    transactionId
  );
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  await initDB();
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM Transactions WHERE id = ?;`,
    transactionId
  );
}