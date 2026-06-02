import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StatusBadge, PropertyTypeBadge } from '../common/Badge.jsx';

export default function RecentListings({ listings = [] }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Recent Listings</h3>
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all <ArrowRight size={13} />
        </button>
      </div>
      <div className="divide-y divide-slate-50">
        {listings.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">No listings yet</div>
        )}
        {listings.map((l) => (
          <div
            key={l.id}
            onClick={() => navigate(`/listings/${l.id}`)}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            {/* Icon placeholder */}
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-sm">
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
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-900">€{Number(l.price).toLocaleString()}</p>
              <StatusBadge status={l.availability_status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
