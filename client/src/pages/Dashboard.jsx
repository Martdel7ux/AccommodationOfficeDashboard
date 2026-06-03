import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CheckCircle2, XCircle, Euro, Plus } from 'lucide-react';
import { getStats } from '../utils/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StatsCard from '../components/Dashboard/StatsCard.jsx';
import { PropertyTypeChart, AvailabilityChart, BedroomsChart, AudienceChart } from '../components/Dashboard/Charts.jsx';
import RecentListings from '../components/Dashboard/RecentListings.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('dashboard.morning') : hour < 17 ? t('dashboard.afternoon') : t('dashboard.evening');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary btn-sm">{t('common.retry')}</button>
      </div>
    );
  }

  if (!stats) return <LoadingSpinner text={t('common.loading')} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{greeting}!</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <button onClick={() => navigate('/listings/new')} className="btn-primary">
          <Plus size={16} />
          {t('dashboard.addListing')}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label={t('dashboard.totalListings')}
          value={stats.total}
          sub={t('dashboard.allProperties')}
          icon={Home}
          color="blue"
        />
        <StatsCard
          label={t('dashboard.available')}
          value={stats.available}
          sub={`${stats.total ? Math.round((stats.available / stats.total) * 100) : 0}${t('dashboard.ofTotal')}`}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          label={t('dashboard.unavailable')}
          value={stats.unavailable}
          sub={`${stats.total ? Math.round((stats.unavailable / stats.total) * 100) : 0}${t('dashboard.ofTotal')}`}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          label={t('dashboard.avgPrice')}
          value={stats.avgPrice ? `€${Number(stats.avgPrice).toLocaleString()}` : '—'}
          sub={t('dashboard.acrossAll')}
          icon={Euro}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PropertyTypeChart data={stats.byType} />
        <AvailabilityChart available={stats.available} unavailable={stats.unavailable} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BedroomsChart data={stats.byBedrooms} />
        <AudienceChart data={stats.byAudience} />
      </div>

      <RecentListings listings={stats.recentListings} />
    </div>
  );
}
