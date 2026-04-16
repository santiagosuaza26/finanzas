import { getDB, initDB } from '../database/db';

export type Category = {
	id: number;
	name: string;
	type: 'income' | 'expense';
	icon: string | null;
};

export async function getCategories(): Promise<Category[]> {
	await initDB();
	const db = await getDB();

	const rows = await db.getAllAsync<Category>(
		`SELECT id, name, type, icon
		 FROM Categories
		 ORDER BY name ASC;`
	);

	return rows;
}

export async function seedDefaultCategories(): Promise<void> {
	await initDB();
	const db = await getDB();

	const countRow = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM Categories;');
	const total = countRow?.total ?? 0;

	if (total > 0) {
		return;
	}

	await db.runAsync(
		`INSERT INTO Categories (name, type, icon)
		 VALUES
			 ('Alimentacion', 'expense', 'utensils'),
			 ('Salario', 'income', 'wallet'),
			 ('Transporte', 'expense', 'bus');`
	);
}
