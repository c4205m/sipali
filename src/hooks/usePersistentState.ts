import { useCallback, useState } from "react"
import type { Dispatch, SetStateAction } from "react"

const store = new Map<string, unknown>()

export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() =>
    store.has(key) ? (store.get(key) as T) : initial,
  )

  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (value) => {
      setState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: T) => T)(prev)
            : value
        store.set(key, next)
        return next
      })
    },
    [key],
  )

  return [state, set]
}
