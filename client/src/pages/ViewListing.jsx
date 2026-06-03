import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, MapPin, Phone, Mail, Bed, Euro,
  Footprints, Calendar, Users, Sofa, ChevronLeft, ChevronRight, ImageIcon,
} from 'lucide-react';
import { getAccommodation, deleteAccommodation } from '../utils/api.js';
import { StatusBadge, PropertyTypeBadge, AudienceBadge } from '../components/common/Badge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

function InfoRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ViewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing]   = useState(null);
  const [imgIdx, setImgIdx]     = useState(0);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    getAccommodation(id)
      .then(setListing)
      .catch(() => setFetchError('Could not load listing.'));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently?')) return;
    await deleteAccommodation(id);
    navigate('/listings');
  };

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-500 text-sm">{fetchError}</p>
        <button onClick={() => navigate('/listings')} className="btn-secondary btn-sm">
          Back to Listings
        </button>
      </div>
    );
  }

  if (!listing) return <LoadingSpinner text="Loading listing…" />;

  const l       = listing;
  const images  = l.images || [];
  const hasImgs = images.length > 0;

  const AUDIENCE_MAP   = { 'full-time': 'Full-time Students', erasmus: 'Erasmus Students', both: 'All Students' };
  const FURNISH_MAP    = { 'fully-furnished': 'Fully Furnished', 'semi-furnished': 'Semi-Furnished' };
  const TYPE_MAP       = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };

  return (
    <div className="animate-fade-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={15} />
          All Listings
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/listings/${id}/edit`)} className="btn-secondary">
            <Pencil size={14} />
            Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: images + description */}
        <div className="xl:col-span-2 space-y-5">
          {/* Image gallery */}
          <div className="card overflow-hidden">
            {hasImgs ? (
              <>
                <div className="relative h-80 bg-slate-100">
                  <img
                    src={images[imgIdx].public_url || `/uploads/${images[imgIdx].filename}`}
                    alt={l.address}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setImgIdx(i)}
                        className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          i === imgIdx ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.public_url || `/uploads/${img.filename}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center gap-2 text-slate-300 bg-slate-50">
                <ImageIcon size={40} />
                <p className="text-sm">No photos uploaded</p>
              </div>
            )}
          </div>

          {/* Description */}
          {l.description && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{l.description}</p>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="space-y-4">
          {/* Header card */}
          <div className="card p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <StatusBadge status={l.availability_status} />
              <PropertyTypeBadge type={l.property_type} />
              <AudienceBadge audience={l.target_audience} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {l.bedrooms ? `${l.bedrooms}-Bedroom ` : ''}{TYPE_MAP[l.property_type] || l.property_type}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1.5">
              <MapPin size={13} className="flex-shrink-0 text-slate-400" />
              {l.address}
            </div>
            <p className="text-3xl font-bold text-primary-600 mt-4">
              €{Number(l.price).toLocaleString()}
              <span className="text-sm font-normal text-slate-400">/month</span>
            </p>
          </div>

          {/* Property details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Property Details</h3>
            <div>
              <InfoRow icon={Bed}      label="Bedrooms"     value={l.bedrooms ? `${l.bedrooms} bedroom${l.bedrooms > 1 ? 's' : ''}` : 'Studio'} />
              <InfoRow icon={Sofa}     label="Furnishing"   value={FURNISH_MAP[l.furnishing_status] || l.furnishing_status} />
              <InfoRow icon={Users}    label="Suitable for" value={AUDIENCE_MAP[l.target_audience] || l.target_audience} />
              <InfoRow icon={Calendar} label="Available from" value={l.availability_date ? new Date(l.availability_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Immediately'} />
              {!!l.walking_distance && (
                <div className="flex items-center gap-2 py-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Footprints size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-emerald-700 font-medium">Within walking distance of UNIC</span>
                </div>
              )}
            </div>
          </div>

          {/* Landlord contact */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Landlord Contact</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">
                  {l.first_name.charAt(0)}{l.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{l.first_name} {l.last_name}</p>
                <p className="text-xs text-slate-400">Property Owner</p>
              </div>
            </div>
            <a
              href={`tel:${l.phone}`}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <Phone size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
              <span className="text-sm text-slate-700">{l.phone}</span>
            </a>
            <a
              href={`mailto:${l.email}`}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <Mail size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
              <span className="text-sm text-slate-700 truncate">{l.email}</span>
            </a>
          </div>

          {/* Metadata */}
          <div className="card px-5 py-4 space-y-2">
            {l.created_by_name && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-600">
                    {l.created_by_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Added by <span className="font-medium text-slate-700">{l.created_by_name}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {' · '}
                    {new Date(l.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
              <span>Added {new Date(l.created_at).toLocaleDateString('en-GB')}</span>
              {l.updated_at !== l.created_at && (
                <span>Updated {new Date(l.updated_at).toLocaleDateString('en-GB')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
