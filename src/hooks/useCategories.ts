import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Category } from '../types';

export function useCategories(): Category[] {
  return useLiveQuery(() => db.categories.toArray()) ?? [];
}

export function useCategoryMap(): Record<string, Category> {
  const categories = useCategories();
  return Object.fromEntries(categories.map((c) => [c.id, c]));
}
