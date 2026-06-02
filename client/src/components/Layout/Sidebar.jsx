import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Home, PlusCircle, Settings, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/listings',  label: 'All Listings',  icon: Home },
  { to: '/listings/new', label: 'Add Listing', icon: PlusCircle },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-30 shadow-[1px_0_0_#e2e8f0]">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-100">
        <img
          src="/unic-logo.png"
          alt="UNIC Accommodation Office"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === '/dashboard'
                ? location.pathname === '/dashboard'
                : to === '/listings'
                ? location.pathname === '/listings'
                : location.pathname.startsWith(to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                    ${active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon
                    size={17}
                    className={`flex-shrink-0 transition-colors ${
                      active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} className="text-primary-400" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Settings size={13} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">Accommodation Office</p>
            <p className="text-[10px] text-slate-400 truncate">University of Nicosia</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
