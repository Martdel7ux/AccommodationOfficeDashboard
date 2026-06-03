import { useNavigate } from 'react-router-dom';
import { MapPin, User, Bed, Footprints, Eye, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { StatusBadge, PropertyTypeBadge, AudienceBadge } from '../common/Badge.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function ListingCard({ listing, onDelete }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const l = listing;
  const mainImage = l.images?.[0];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete listing at "${l.address}"?`)) onDelete(l.id);
  };

  return (
    <div className="card-hover flex flex-col overflow-hidden group">
      {/* Image */}
      <div
        className="relative h-44 bg-slate-100 cursor-pointer flex-shrink-0 overflow-hidden"
        onClick={() => navigate(`/listings/${l.id}`)}
      >
        {mainImage ? (
          <img
            src={mainImage.public_url || `/uploads/${mainImage.filename}`}
            alt={l.address}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <ImageIcon size={32} />
            <p className="text-xs">{t('listings.noImage')}</p>
          </div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <StatusBadge status={l.availability_status} />
        </div>
        {l.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
            +{l.images.length - 1} more
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Type + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            <PropertyTypeBadge type={l.property_type} />
            {l.bedrooms && (
              <span className="badge badge-gray">
                <Bed size={10} />
                {l.bedrooms} {t('property.bed')}
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-slate-900 flex-shrink-0">
            €{Number(l.price).toLocaleString()}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </p>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-sm text-slate-600">
          <MapPin size={13} className="flex-shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-2 leading-tight">{l.address}</span>
        </div>

        {/* Landlord + audience */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <User size={11} className="text-slate-400" />
            {l.first_name} {l.last_name}
          </div>
          <AudienceBadge audience={l.target_audience} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {l.furnishing_status && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
              {l.furnishing_status === 'fully-furnished' ? 'Fully Furnished' : 'Semi-Furnished'}
            </span>
          )}
          {!!l.walking_distance && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 flex items-center gap-0.5">
              <Footprints size={9} />
              {t('property.walkingDist')}
            </span>
          )}
          {l.availability_date && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
              From {new Date(l.availability_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>

        {/* Added by */}
        {l.created_by_name && (
          <p className="text-[10px] text-slate-400 truncate">
            Added by <span className="font-medium text-slate-500">{l.created_by_name}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 pt-1 border-t border-slate-100 mt-auto">
          <button
            onClick={() => navigate(`/listings/${l.id}`)}
            className="btn-ghost btn-sm flex-1 justify-center"
          >
            <Eye size={13} />
            {t('listings.view')}
          </button>
          <button
            onClick={() => navigate(`/listings/${l.id}/edit`)}
            className="btn-secondary btn-sm flex-1 justify-center"
          >
            <Pencil size={13} />
            {t('listings.edit')}
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger btn-sm px-2.5"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
