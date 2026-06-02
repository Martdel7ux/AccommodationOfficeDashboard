import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, PlusCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/listings',     label: 'All Listings', icon: Home },
  { to: '/listings/new', label: 'Add Listing',  icon: PlusCircle },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const fullName = user?.user_metadata?.full_name || '';
  const email    = user?.email || '';
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-30">
      {/* Brand logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <img
          src="/unic-logo.png"
          alt="UNIC Accommodation Office"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">
          Navigation
        </p>
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

      {/* User profile + logout */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            {fullName && (
              <p className="text-xs font-semibold text-slate-800 truncate">{fullName}</p>
            )}
            <p className="text-[11px] text-slate-400 truncate">{email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
