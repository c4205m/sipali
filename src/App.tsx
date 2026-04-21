import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import AddTransactionModal from './components/AddTransactionModal';
import type { Transaction } from './types';
import Home from './pages/Home';
import { ensureCategoriesExist, ensureSettingsExist, ensureAccountsExist } from './db/db';
import { fetchAndCacheRates } from './utils/rates';
import { defaultTxFilters, defaultHomeFilters } from './utils/filters';

const Stats        = lazy(() => import('./pages/Stats'));
const Settings     = lazy(() => import('./pages/Settings'));
const Transactions = lazy(() => import('./pages/Transactions'));
const SharePage    = lazy(() => import('./pages/SharePage'));

export default function App() {
  const location = useLocation();
  const isSharePage = location.pathname.startsWith('/share');

  const [showModal,    setShowModal]    = useState(true);
  const [prefill,      setPrefill]      = useState<Transaction | undefined>();
  const [homeFilters,  setHomeFilters]  = useState(defaultHomeFilters);
  const [txFilters,    setTxFilters]    = useState(defaultTxFilters);
  const showModalRef = useRef(true);

  const openModal = useCallback((t?: Transaction) => {
    setPrefill(t);
    showModalRef.current = true;
    setShowModal(true);
  }, []);

  useEffect(() => {
    ensureCategoriesExist();
    ensureSettingsExist();
    ensureAccountsExist();
    fetchAndCacheRates();
  }, []);

  useEffect(() => {
    const onFocusOut = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
      setTimeout(() => {
        if (showModalRef.current) return;
        if (!document.activeElement || document.activeElement === document.body)
          document.querySelector<HTMLElement>('.h-dvh')?.scrollTo(0, 0);
      }, 100);
    };
    document.addEventListener('focusout', onFocusOut);
    return () => document.removeEventListener('focusout', onFocusOut);
  }, []);

  if (isSharePage) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/share/:data" element={<SharePage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <div className="h-dvh overflow-y-auto">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home onAddTransaction={openModal} filters={homeFilters} onFiltersChange={setHomeFilters} />} />
            <Route path="/transactions" element={<Transactions filters={txFilters} onFiltersChange={setTxFilters} />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
      {showModal && (
        <AddTransactionModal
          prefill={prefill}
          onClose={() => { showModalRef.current = false; setShowModal(false); setPrefill(undefined); }}
        />
      )}
    </>
  );
}
