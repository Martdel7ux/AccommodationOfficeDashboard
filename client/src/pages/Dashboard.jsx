import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CheckCircle2, XCircle, Euro, Plus } from 'lucide-react';
import { getStats } from '../utils/api.js';
import StatsCard from '../components/Dashboard/StatsCard.jsx';
import { PropertyTypeChart, AvailabilityChart, BedroomsChart, AudienceChart } from '../components/Dashboard/Charts.jsx';
import RecentListings from '../components/Dashboard/RecentListings.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary btn-sm">Retry</button>
      </div>
    );
  }

  if (!stats) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{greeting}! 👋</h1>
          <p className="page-subtitle">Here's your accommodation overview for today.</p>
        </div>
        <button
          onClick={() => navigate('/listings/new')}
          className="btn-primary"
        >
          <Plus size={16} />
          Add Listing
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Listings"
          value={stats.total}
          sub="All properties"
          icon={Home}
          color="blue"
        />
        <StatsCard
          label="Available"
          value={stats.available}
          sub={`${stats.total ? Math.round((stats.available / stats.total) * 100) : 0}% of total`}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          label="Unavailable"
          value={stats.unavailable}
          sub={`${stats.total ? Math.round((stats.unavailable / stats.total) * 100) : 0}% of total`}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          label="Avg. Monthly Price"
          value={stats.avgPrice ? `€${Number(stats.avgPrice).toLocaleString()}` : '—'}
          sub="Across all listings"
          icon={Euro}
          color="amber"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PropertyTypeChart data={stats.byType} />
        <AvailabilityChart available={stats.available} unavailable={stats.unavailable} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BedroomsChart data={stats.byBedrooms} />
        <AudienceChart data={stats.byAudience} />
      </div>

      {/* Recent listings */}
      <RecentListings listings={stats.recentListings} />

    </div>
  );
}
