import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const TYPE_LABELS = {
  apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room',
};
const AUDIENCE_LABELS = {
  'full-time': 'Full-time', erasmus: 'Erasmus', both: 'Both',
};
const BAR_COLOR  = '#C41230';
const PIE_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#C41230'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-hover px-3 py-2 text-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-primary-600 font-bold">{payload[0].value} listings</p>
    </div>
  );
};

export function PropertyTypeChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: TYPE_LABELS[d.property_type] || d.property_type,
    count: d.count,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Listings by Property Type</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AvailabilityChart({ available = 0, unavailable = 0 }) {
  const data = [
    { name: 'Available',   value: available },
    { name: 'Unavailable', value: unavailable },
  ].filter((d) => d.value > 0);
  const COLORS = ['#10B981', '#EF4444'];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x  = cx + r * Math.cos(-midAngle * RADIAN);
    const y  = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Availability Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: '#64748B', fontSize: 12 }}>{value}</span>
            )}
          />
          <Tooltip
            formatter={(v) => [`${v} listings`, '']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BedroomsChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.bedrooms ? `${d.bedrooms} Bed` : 'Studio',
    count: d.count,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Listings by Bedrooms</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AudienceChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: AUDIENCE_LABELS[d.target_audience] || d.target_audience,
    value: d.count,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Target Audience</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: '#64748B', fontSize: 12 }}>{value}</span>}
          />
          <Tooltip
            formatter={(v) => [`${v} listings`, '']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
