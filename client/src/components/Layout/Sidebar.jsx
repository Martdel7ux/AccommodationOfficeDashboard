import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, PlusCircle, LogOut, ChevronRight, Download, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEffect, useState } from 'react';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/listings',     label: 'All Listings', icon: Home },
  { to: '/listings/new', label: 'Add Listing',  icon: PlusCircle },
  { to: '/flatmates',    label: 'Flat Mate',    icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled]         = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

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
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col z-30"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.06)',
      }}
    >
      {/* Brand logo */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid rgba(203,213,225,0.3)' }}
      >
        <img
          src="/unic-logo.png"
          alt="UNIC Accommodation Office"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
          Navigation
        </p>
        <ul className="space-y-1">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-200 group relative
                    ${active ? 'text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(196,18,48,0.10) 0%, rgba(255,77,109,0.06) 100%)',
                    border: '1px solid rgba(196,18,48,0.15)',
                    boxShadow: '0 2px 8px rgba(196,18,48,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={active ? {
                      background: 'linear-gradient(135deg, #C41230, #E11740)',
                      boxShadow: '0 4px 12px rgba(196,18,48,0.30)',
                    } : {
                      background: 'rgba(148,163,184,0.12)',
                    }}
                  >
                    <Icon size={14} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} className="text-primary-400" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Install app button */}
      {installPrompt && !installed && (
        <div className="px-4 pb-3">
          <button
            onClick={handleInstall}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(196,18,48,0.08), rgba(255,77,109,0.05))',
              border: '1px solid rgba(196,18,48,0.15)',
            }}
          >
            <Download size={15} className="text-primary-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-700 leading-tight">Install App</p>
              <p className="text-[10px] text-primary-500 leading-tight mt-0.5">Open without a browser</p>
            </div>
          </button>
        </div>
      )}

      {/* User profile + logout */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid rgba(203,213,225,0.3)' }}
      >
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200"
          style={{ cursor: 'default' }}
        >
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            title="Account settings"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #C41230, #E11740)',
                boxShadow: '0 4px 12px rgba(196,18,48,0.30)',
              }}
            >
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              {fullName && (
                <p className="text-xs font-bold text-slate-800 truncate">{fullName}</p>
              )}
              <p className="text-[11px] text-slate-400 truncate">{email}</p>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
            style={{ background: 'rgba(148,163,184,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(254,242,242,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(148,163,184,0.08)'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
