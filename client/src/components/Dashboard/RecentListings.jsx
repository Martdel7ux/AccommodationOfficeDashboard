import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCircle } from 'lucide-react';
import { StatusBadge, PropertyTypeBadge } from '../common/Badge.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

function formatAdded(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function RecentListings({ listings = [] }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(203,213,225,0.25)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{ width: 3, height: 18, borderRadius: 99, background: 'linear-gradient(180deg, #C41230 0%, #C4123044 100%)', flexShrink: 0 }} />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">{t('dashboard.recentListings')}</h3>
        </div>
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {t('dashboard.viewAll')} <ArrowRight size={13} />
        </button>
      </div>
      <div style={{ divide: 'unset' }}>
        {listings.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">{t('dashboard.noListings')}</div>
        )}
        {listings.map((l, idx) => (
          <div
            key={l.id}
            onClick={() => navigate(`/listings/${l.id}`)}
            className="flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-all duration-200"
            style={{
              borderTop: idx > 0 ? '1px solid rgba(203,213,225,0.2)' : 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Bedroom / type indicator */}
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
              {l.bedrooms ? `${l.bedrooms}B` : 'St'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <PropertyTypeBadge type={l.property_type} />
                {l.bedrooms && (
                  <span className="text-xs text-slate-400">{l.bedrooms} Bed</span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate mt-0.5">{l.address}</p>
              {/* Added by + time */}
              <div className="flex items-center gap-1 mt-1">
                <UserCircle size={11} className="text-slate-300 flex-shrink-0" />
                <p className="text-[11px] text-slate-400 truncate">
                  {l.created_by_name
                    ? <><span className="font-medium text-slate-500">{l.created_by_name}</span> · {formatAdded(l.created_at)}</>
                    : formatAdded(l.created_at)
                  }
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-900">€{Number(l.price).toLocaleString()}</p>
              <div className="mt-1">
                <StatusBadge status={l.availability_status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
