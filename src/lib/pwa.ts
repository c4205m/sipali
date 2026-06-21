import { registerSW } from "virtual:pwa-register"

let registration: ServiceWorkerRegistration | undefined

registerSW({
  onRegisteredSW(_swUrl, reg) {
    registration = reg
  },
})

// With registerType "autoUpdate" a new version activates and reloads on its
// own, so callers only handle the "already up to date" case.
export async function checkForUpdates(): Promise<boolean> {
  if (!registration) throw new Error("Service worker not registered")
  await registration.update()
  return registration.installing !== null || registration.waiting !== null
}
