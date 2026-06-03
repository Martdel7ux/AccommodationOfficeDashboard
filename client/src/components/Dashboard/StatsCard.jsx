import { TrendingUp } from 'lucide-react';

const COLORS = {
  blue: {
    gradient: 'linear-gradient(135deg, #E11740 0%, #C41230 100%)',
    shadow:   '0 6px 20px rgba(196,18,48,0.32)',
    tint:     'rgba(196,18,48,0.05)',
    glow:     '0 0 0 1px rgba(196,18,48,0.08)',
  },
  green: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow:   '0 6px 20px rgba(16,185,129,0.30)',
    tint:     'rgba(16,185,129,0.05)',
    glow:     '0 0 0 1px rgba(16,185,129,0.08)',
  },
  red: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    shadow:   '0 6px 20px rgba(220,38,38,0.28)',
    tint:     'rgba(220,38,38,0.04)',
    glow:     '0 0 0 1px rgba(220,38,38,0.07)',
  },
  amber: {
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow:   '0 6px 20px rgba(245,158,11,0.30)',
    tint:     'rgba(245,158,11,0.05)',
    glow:     '0 0 0 1px rgba(245,158,11,0.08)',
  },
  purple: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadow:   '0 6px 20px rgba(124,58,237,0.28)',
    tint:     'rgba(124,58,237,0.05)',
    glow:     '0 0 0 1px rgba(124,58,237,0.07)',
  },
};

export default function StatsCard({ label, value, sub, icon: Icon, color, trend }) {
  const c = COLORS[color] || COLORS.blue;

  return (
    <div
      className="p-5 flex items-start gap-4"
      style={{
        borderRadius: 22,
        background: `linear-gradient(170deg,
          rgba(255,255,255,0.62) 0%,
          rgba(255,255,255,0.35) 100%
        )`,
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.48)',
        borderTopColor: 'rgba(255,255,255,0.90)',
        boxShadow: [
          '0 8px 32px rgba(0,0,0,0.07)',
          '0 2px 8px rgba(0,0,0,0.04)',
          `inset 0 1px 0 rgba(255,255,255,0.92)`,
          `inset 0 -1px 0 rgba(255,255,255,0.12)`,
          c.glow,
        ].join(', '),
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.015)';
        e.currentTarget.style.boxShadow = [
          '0 16px 48px rgba(0,0,0,0.10)',
          '0 4px 12px rgba(0,0,0,0.06)',
          'inset 0 1px 0 rgba(255,255,255,1)',
          'inset 0 -1px 0 rgba(255,255,255,0.18)',
          c.glow,
        ].join(', ');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = [
          '0 8px 32px rgba(0,0,0,0.07)',
          '0 2px 8px rgba(0,0,0,0.04)',
          'inset 0 1px 0 rgba(255,255,255,0.92)',
          'inset 0 -1px 0 rgba(255,255,255,0.12)',
          c.glow,
        ].join(', ');
      }}
    >
      {/* Gradient icon */}
      <div
        style={{
          width: 42, height: 42,
          borderRadius: 14,
          background: c.gradient,
          boxShadow: c.shadow + ', inset 0 1px 0 rgba(255,255,255,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.20)',
          borderTopColor: 'rgba(255,255,255,0.38)',
        }}
      >
        <Icon size={18} className="text-white" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>

      {/* Trend badge */}
      {trend != null && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 ${trend >= 0 ? 'text-emerald-700' : 'text-red-600'}`}
          style={{
            borderRadius: 99,
            background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(220,38,38,0.10)',
            border: `1px solid ${trend >= 0 ? 'rgba(16,185,129,0.20)' : 'rgba(220,38,38,0.16)'}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <TrendingUp size={11} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
