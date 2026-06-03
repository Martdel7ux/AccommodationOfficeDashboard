import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, PlusCircle, LogOut, ChevronRight, Download, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard',    key: 'nav.dashboard',   icon: LayoutDashboard },
  { to: '/listings',     key: 'nav.allListings',  icon: Home },
  { to: '/listings/new', key: 'nav.addListing',   icon: PlusCircle },
  { to: '/flatmates',    key: 'nav.flatMate',     icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();

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
        background: 'linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.42) 100%)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderRight: '1px solid rgba(255,255,255,0.45)',
        boxShadow: '8px 0 40px rgba(0,0,0,0.06), inset -1px 0 0 rgba(255,255,255,0.55)',
      }}
    >
      {/* Brand logo */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.38)', background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 100%)' }}>
        <img src="/unic-logo.png" alt="UNIC Accommodation Office" className="h-12 w-auto object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-3">
          {t('nav.navigation')}
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
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
                  } : { background: 'transparent', border: '1px solid transparent' }}
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
                    } : { background: 'rgba(148,163,184,0.12)' }}
                  >
                    <Icon size={14} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  </div>
                  <span className="flex-1">{t(key)}</span>
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
              <p className="text-xs font-semibold text-primary-700 leading-tight">{t('nav.installApp')}</p>
              <p className="text-[10px] text-primary-500 leading-tight mt-0.5">{t('nav.installSub')}</p>
            </div>
          </button>
        </div>
      )}

      {/* Language toggle */}
      <div className="px-4 pb-3">
        <div
          className="flex overflow-hidden"
          style={{
            borderRadius: 99,
            border: '1px solid rgba(255,255,255,0.50)',
            borderTopColor: 'rgba(255,255,255,0.80)',
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.60)',
            padding: '2px',
            gap: '2px',
          }}
        >
          {['en', 'el'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-1.5 text-xs font-semibold transition-all duration-300"
              style={{
                borderRadius: 99,
                ...(lang === l ? {
                  background: 'linear-gradient(135deg, rgba(225,23,64,0.95), rgba(196,18,48,0.92))',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(196,18,48,0.30), inset 0 1px 0 rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  borderTopColor: 'rgba(255,255,255,0.35)',
                } : {
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid transparent',
                }),
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User profile + logout */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.38)', background: 'linear-gradient(0deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.05) 100%)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            title={t('common.settings')}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C41230, #E11740)', boxShadow: '0 4px 12px rgba(196,18,48,0.30)' }}
            >
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              {fullName && <p className="text-xs font-semibold text-slate-800 truncate">{fullName}</p>}
              <p className="text-[11px] text-slate-400 truncate">{email}</p>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            title={t('common.signOut')}
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
