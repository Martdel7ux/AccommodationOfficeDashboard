import { TrendingUp } from 'lucide-react';

export default function StatsCard({ label, value, sub, icon: Icon, color, trend }) {
  const colors = {
    blue:   { bg: 'bg-primary-50',  text: 'text-primary-600',  ring: 'ring-primary-100' },
    green:  { bg: 'bg-emerald-50',  text: 'text-emerald-600',  ring: 'ring-emerald-100' },
    red:    { bg: 'bg-red-50',      text: 'text-red-500',      ring: 'ring-red-100' },
    amber:  { bg: 'bg-amber-50',    text: 'text-amber-600',    ring: 'ring-amber-100' },
    purple: { bg: 'bg-violet-50',   text: 'text-violet-600',   ring: 'ring-violet-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`${c.bg} ${c.ring} ring-1 p-2.5 rounded-xl flex-shrink-0`}>
        <Icon size={20} className={c.text} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
