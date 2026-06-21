# sipali

A personal finance tracker. Offline, local-first — all data lives in your browser, nothing is sent to a server.

Live: https://c4205m.github.io/sipali/

## Features

- **Transactions** — expenses, income, and transfers between accounts.
- **Multi-currency** — pick a display currency; amounts convert using live rates, with the historical rate of each transaction's logged day shown in its details.
- **Recurring & installments** — schedule repeating entries or split a purchase into N payments; upcoming items surface on the home screen.
- **Split codes** — share a cost as a compact code, paste one back to prefill a transaction.
- **Accounts & categories** — manage your own, with per-category icons and colors.
- **Stats** — income/expense, daily activity, category and importance breakdowns.
- **iOS Shortcuts** — on Apple devices, hand a transaction to a named Shortcut as JSON.
- **Accent color** — pick the app's accent from presets or a custom color.
- **PWA** — installable, works offline, auto-updates on launch.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS · Dexie (IndexedDB) · Radix UI · Recharts · Framer Motion · vite-plugin-pwa

Exchange rates come from the free, key-less [fawazahmed0 currency-api](https://github.com/fawazahmed0/exchange-api).

## Development

```bash
npm install
npm run dev      # https dev server (LAN host enabled)
npm run build    # type-check + production build
npm run preview  # serve the build
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages. The app is served under the `/sipali/` base path and uses hash routing, so deep links resolve without server config.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
