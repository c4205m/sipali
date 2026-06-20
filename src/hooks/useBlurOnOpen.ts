import { useEffect } from "react"

// Blur the focused trigger when an overlay opens, so focus isn't left inside
// the background subtree that Radix/Vaul mark aria-hidden. Resolves the
// "Blocked aria-hidden on an element because its descendant retained focus"
// warning for dialogs and drawers.
export function useBlurOnOpen(open: boolean): void {
  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [open])
}
