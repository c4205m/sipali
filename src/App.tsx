import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import AddTransactionModal from './components/AddTransactionModal';
import type { Transaction } from './types';
import Home from './pages/Home';
import { ensureCategoriesExist, ensureSettingsExist, ensureAccountsExist } from './db/db';
import { fetchAndCacheRates } from './utils/rates';

const Stats        = lazy(() => import('./pages/Stats'));
const Settings     = lazy(() => import('./pages/Settings'));
const Transactions = lazy(() => import('./pages/Transactions'));

export default function App() {
  const [showModal, setShowModal] = useState(true);
  const [prefill,   setPrefill]   = useState<Transaction | undefined>();

  const openModal = useCallback((t?: Transaction) => {
    setPrefill(t);
    setShowModal(true);
  }, []);

  useEffect(() => {
    ensureCategoriesExist();
    ensureSettingsExist();
    ensureAccountsExist();
    fetchAndCacheRates();
  }, []);

  useEffect(() => {
    const onFocusOut = () =>
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body)
          document.querySelector<HTMLElement>('.h-dvh')?.scrollTo(0, 0);
      }, 100);
    document.addEventListener('focusout', onFocusOut);
    return () => document.removeEventListener('focusout', onFocusOut);
  }, []);

  return (
    <>
      <div className="h-dvh overflow-y-auto">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home onAddTransaction={openModal} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
      {showModal && (
        <AddTransactionModal
          prefill={prefill}
          onClose={() => { setShowModal(false); setPrefill(undefined); }}
        />
      )}
    </>
  );
}
