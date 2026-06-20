// Radix Select dismissal and the surrounding Vaul/Dialog sheet both react to
// the same document pointer-down: clicking to close an open Select also closes
// the whole sheet in one click.
//
// Vaul/Radix honor e.preventDefault() inside onPointerDownOutside/onInteractOutside,
// so the sheet's Content guards those with guardSheetClose(). The tricky part is
// detection: by the time the handler runs the Select has already closed and the
// click target is <body> (Radix sets pointer-events:none on it). So we track
// Select open/close state explicitly rather than sniffing the DOM, with a short
// grace window to cover the same-tick close race.
let openSelectCount = 0
let lastSelectCloseAt = 0

export function notifySelectOpenChange(open: boolean): void {
  if (open) {
    openSelectCount++
  } else {
    openSelectCount = Math.max(0, openSelectCount - 1)
    lastSelectCloseAt = Date.now()
  }
}

interface DismissableEvent {
  preventDefault: () => void
}

// Prevent the sheet from closing while a Select is open or just closed.
export function guardSheetClose(event: DismissableEvent): void {
  if (openSelectCount > 0 || Date.now() - lastSelectCloseAt < 300) {
    event.preventDefault()
  }
}
