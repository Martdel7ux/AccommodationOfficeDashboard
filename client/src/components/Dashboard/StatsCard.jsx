import { TrendingUp } from 'lucide-react';

const COLORS = {
  blue: {
    gradient: 'linear-gradient(135deg, #C41230 0%, #E11740 100%)',
    shadow:   '0 6px 16px rgba(196,18,48,0.28)',
    glow:     'rgba(196,18,48,0.08)',
    text:     'text-primary-600',
  },
  green: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow:   '0 6px 16px rgba(16,185,129,0.28)',
    glow:     'rgba(16,185,129,0.07)',
    text:     'text-emerald-600',
  },
  red: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    shadow:   '0 6px 16px rgba(220,38,38,0.25)',
    glow:     'rgba(220,38,38,0.07)',
    text:     'text-red-600',
  },
  amber: {
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow:   '0 6px 16px rgba(245,158,11,0.28)',
    glow:     'rgba(245,158,11,0.08)',
    text:     'text-amber-600',
  },
  purple: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadow:   '0 6px 16px rgba(124,58,237,0.25)',
    glow:     'rgba(124,58,237,0.07)',
    text:     'text-violet-600',
  },
};

export default function StatsCard({ label, value, sub, icon: Icon, color, trend }) {
  const c = COLORS[color] || COLORS.blue;

  return (
    <div
      className="p-5 flex items-start gap-4 transition-all duration-300"
      style={{
        borderRadius: '16px',
        background: `linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: `0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 1px ${c.glow}`,
      }}
    >
      {/* Icon */}
      <div
        className="p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{
          background: c.gradient,
          boxShadow: c.shadow,
          minWidth: '40px',
          minHeight: '40px',
        }}
      >
        <Icon size={18} className="text-white" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>

      {/* Trend */}
      {trend != null && (
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
          }`}
        >
          <TrendingUp size={11} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
