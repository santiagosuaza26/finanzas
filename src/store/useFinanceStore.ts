import { create } from 'zustand';

import { initDB } from '../database/db';
import { type Category, getCategories, seedDefaultCategories } from '../services/categoryService';
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  type TransactionWithCategory,
} from '../services/transactionService';

export type TimeFilter = 'all' | 'today' | 'week' | 'month';

type FinanceState = {
  transactions: TransactionWithCategory[];
  categories: Category[];
  timeFilter: TimeFilter;
  isLoading: boolean;
  error: string | null;
  initApp: () => Promise<void>;
  setTimeFilter: (filter: TimeFilter) => Promise<void>;
  addNewTransaction: (
    monto: number,
    fecha: number,
    nota: string | null,
    idCategoria: number
  ) => Promise<void>;
  updateExistingTransaction: (
    transactionId: number,
    monto: number,
    fecha: number,
    nota: string | null,
    idCategoria: number
  ) => Promise<void>;
  deleteExistingTransaction: (transactionId: number) => Promise<void>;
};

function getDateRange(filter: TimeFilter): { startDate?: number; endDate?: number } {
  if (filter === 'all') {
    return {};
  }

  const now = new Date();
  const endDate = now.getTime();
  const start = new Date(now);

  if (filter === 'today') {
    start.setHours(0, 0, 0, 0);
    return { startDate: start.getTime(), endDate };
  }

  if (filter === 'week') {
    const dayOfWeek = start.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);
    return { startDate: start.getTime(), endDate };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return { startDate: start.getTime(), endDate };
}

async function loadTransactionsAndCategories(filter: TimeFilter) {
  const { startDate, endDate } = getDateRange(filter);
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions(startDate, endDate),
  ]);

  return { categories, transactions };
}

async function loadTransactionsForFilter(filter: TimeFilter) {
  const { startDate, endDate } = getDateRange(filter);
  return getTransactions(startDate, endDate);
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  categories: [],
  timeFilter: 'month',
  isLoading: false,
  error: null,

  initApp: async () => {
    set({ isLoading: true, error: null });

    try {
      await initDB();
      await seedDefaultCategories();

      const { categories, transactions } = await loadTransactionsAndCategories(get().timeFilter);

      set({ categories, transactions, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inicializando la aplicacion';
      set({ error: message, isLoading: false });
    }
  },

  setTimeFilter: async (filter) => {
    set({ isLoading: true, error: null, timeFilter: filter });

    try {
      const transactions = await loadTransactionsForFilter(filter);
      set({ transactions, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error aplicando filtro de tiempo';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  addNewTransaction: async (monto, fecha, nota, idCategoria) => {
    set({ isLoading: true, error: null });

    try {
      await addTransaction(monto, fecha, nota, idCategoria);

      const transactions = await loadTransactionsForFilter(get().timeFilter);

      set({ transactions, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error agregando transaccion';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateExistingTransaction: async (transactionId, monto, fecha, nota, idCategoria) => {
    set({ isLoading: true, error: null });

    try {
      await updateTransaction(transactionId, monto, fecha, nota, idCategoria);

      const transactions = await loadTransactionsForFilter(get().timeFilter);

      set({ transactions, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando transaccion';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteExistingTransaction: async (transactionId) => {
    set({ isLoading: true, error: null });

    try {
      await deleteTransaction(transactionId);

      const transactions = await loadTransactionsForFilter(get().timeFilter);

      set({ transactions, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error borrando transaccion';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
}));