# sipali

A personal finance tracker that runs entirely in the browser — no account, no backend, no sync.

{# **[Live app](https://c4205m.github.io/sipali/)** #}

## Features

- Track expenses, income, and transfers across multiple accounts
- Recurring transactions with interval flags
- Installment support
- Multiple currencies with configurable exchange rates
- Category management
- Stats and charts
- Share transactions via link

## Tech

React + TypeScript + Vite + Tailwind CSS, with all data stored locally in IndexedDB via Dexie.js.

## Local dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```
