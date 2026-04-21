import { useNavigate, useLocation } from 'react-router-dom';
import { Home, List, BarChart2, Settings } from 'lucide-react';

const TABS = [
  { to: '/',             icon: Home,     label: 'Home'     },
  { to: '/transactions', icon: List,     label: 'Ledger'   },
  { to: '/stats',        icon: BarChart2, label: 'Stats'   },
  { to: '/settings',     icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#12122a]/90 backdrop-blur-md border-t border-[#2e2e4e] flex z-50">
      {TABS.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <button
            key={to}
            onPointerDown={() => navigate(to)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors touch-manipulation ${
              isActive ? 'text-[#e94560]' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
