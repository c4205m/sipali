import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import type { Category } from "@/types"

export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => db.categories.toArray(), [])
}

// Lookup map for resolving categoryId → Category in lists/charts.
export function useCategoryMap(): Map<string, Category> {
  const cats = useCategories()
  return new Map((cats ?? []).map((c) => [c.id, c]))
}

export async function addCategory(input: Omit<Category, "id">): Promise<string> {
  const cat: Category = { ...input, id: uid("cat") }
  await db.categories.add(cat)
  return cat.id
}

export async function updateCategory(
  id: string,
  patch: Partial<Category>,
): Promise<void> {
  await db.categories.update(id, patch)
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id)
}
