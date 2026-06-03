import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext.jsx';

const TYPE_KEYS = {
  apartment: 'property.apartment', studio: 'property.studio',
  house: 'property.house', room: 'property.room',
};
const AUDIENCE_KEYS = {
  'full-time': 'property.fullTime', erasmus: 'property.erasmus', both: 'property.allStudents',
};

// ── Premium glass tooltip ─────────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.95)',
      borderRadius: 12,
      padding: '9px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {label && (
        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
          {label}
        </p>
      )}
      <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1, margin: 0 }}>
        {payload[0].value}
        <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginLeft: 5 }}>listings</span>
      </p>
    </div>
  );
};

// ── Glass card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, accent = '#C41230', badge, children }) {
  return (
    <div style={{
      borderRadius: 20,
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.88)',
      boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '17px 22px 13px',
        borderBottom: '1px solid rgba(203,213,225,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 3,
            height: 18,
            borderRadius: 99,
            background: `linear-gradient(180deg, ${accent} 0%, ${accent}44 100%)`,
            flexShrink: 0,
          }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em', margin: 0 }}>
            {title}
          </p>
        </div>
        {badge != null && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            background: `${accent}12`,
            border: `1px solid ${accent}20`,
            borderRadius: 99,
            padding: '2px 10px',
          }}>
            {badge} total
          </span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '18px 22px 22px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Custom donut legend row ───────────────────────────────────────────────────
function LegendRow({ color, label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const barWidth = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, flexShrink: 0,
          boxShadow: `0 2px 6px ${color}55`,
        }} />
        <span style={{ fontSize: 12, color: '#64748b', flex: 1, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{value}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
      </div>
      {/* Mini progress bar */}
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(203,213,225,0.35)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${barWidth}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

// ── No-data placeholder ───────────────────────────────────────────────────────
function NoData() {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <p style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>No data yet</p>
    </div>
  );
}

// ── 1. Listings by Property Type ──────────────────────────────────────────────
export function PropertyTypeChart({ data = [] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({
    name: t(TYPE_KEYS[d.property_type] || d.property_type),
    count: d.count,
  }));

  return (
    <ChartCard title={t('dashboard.byType')} accent="#C41230">
      {chartData.length === 0 ? <NoData /> : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barCategoryGap="38%" margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="redBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4D6D" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#C41230" stopOpacity={1} />
              </linearGradient>
              <filter id="barShadowRed">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#C41230" floodOpacity="0.25" />
              </filter>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              allowDecimals={false} width={28}
            />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(196,18,48,0.04)', radius: [6,6,0,0] }} />
            <Bar
              dataKey="count"
              fill="url(#redBarGrad)"
              radius={[8, 8, 3, 3]}
              maxBarSize={56}
              filter="url(#barShadowRed)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 2. Availability Status ────────────────────────────────────────────────────
export function AvailabilityChart({ available = 0, unavailable = 0 }) {
  const { t } = useLanguage();
  const total = available + unavailable;
  const data  = [
    { name: t('dashboard.available'),   value: available,   color: '#10B981' },
    { name: t('dashboard.unavailable'), value: unavailable, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title={t('dashboard.byAvailability')} accent="#10B981" badge={total}>
      {total === 0 ? <NoData /> : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Donut */}
          <div style={{ flex: '0 0 160px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <defs>
                  <filter id="pieShadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
                  </filter>
                </defs>
                <Pie
                  data={data}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  filter="url(#pieShadow)"
                  startAngle={90} endAngle={-270}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text>
                          <tspan x={cx} y={cy - 2} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0f172a">{total}</tspan>
                          <tspan x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill="#94a3b8">TOTAL</tspan>
                        </text>
                      );
                    }}
                    position="center"
                  />
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} listings`, n]}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.95)',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ flex: 1, paddingLeft: 8 }}>
            {data.map((d) => (
              <LegendRow key={d.name} color={d.color} label={d.name} value={d.value} total={total} />
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// ── 3. Listings by Bedrooms ───────────────────────────────────────────────────
export function BedroomsChart({ data = [] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({
    name: d.bedrooms ? `${d.bedrooms} ${t('property.bed')}` : t('property.studio'),
    count: d.count,
  }));

  return (
    <ChartCard title={t('dashboard.byBedrooms')} accent="#7C3AED">
      {chartData.length === 0 ? <NoData /> : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barCategoryGap="38%" margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="violetBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={1} />
              </linearGradient>
              <filter id="barShadowViolet">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7C3AED" floodOpacity="0.22" />
              </filter>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              allowDecimals={false} width={28}
            />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(124,58,237,0.04)', radius: [6,6,0,0] }} />
            <Bar
              dataKey="count"
              fill="url(#violetBarGrad)"
              radius={[8, 8, 3, 3]}
              maxBarSize={56}
              filter="url(#barShadowViolet)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 4. Target Audience ────────────────────────────────────────────────────────
const AUDIENCE_COLORS = ['#C41230', '#3B82F6', '#F59E0B'];

export function AudienceChart({ data = [] }) {
  const { t } = useLanguage();
  const chartData = data.map((d, i) => ({
    name:  t(AUDIENCE_KEYS[d.target_audience] || d.target_audience),
    value: d.count,
    color: AUDIENCE_COLORS[i % AUDIENCE_COLORS.length],
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title={t('dashboard.byAudience')} accent="#3B82F6" badge={total}>
      {total === 0 ? <NoData /> : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Donut */}
          <div style={{ flex: '0 0 160px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90} endAngle={-270}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text>
                          <tspan x={cx} y={cy - 2} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0f172a">{total}</tspan>
                          <tspan x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill="#94a3b8">TOTAL</tspan>
                        </text>
                      );
                    }}
                    position="center"
                  />
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} listings`, n]}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.95)',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ flex: 1, paddingLeft: 8 }}>
            {chartData.map((d) => (
              <LegendRow key={d.name} color={d.color} label={d.name} value={d.value} total={total} />
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
