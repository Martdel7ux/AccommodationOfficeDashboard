import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, Home } from 'lucide-react';
import { createAccommodation, getAccommodations } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AccommodationForm from '../components/Forms/AccommodationForm.jsx';

// Strips spaces, dashes, parentheses, + for loose phone comparison
const normalizePhone = (s) => (s || '').replace(/[\s\-+(). ]/g, '').toLowerCase();

async function findDuplicates(formData) {
  if (!formData.phone?.trim()) return [];
  try {
    const results = await getAccommodations({ phone: formData.phone.trim() });
    return results.filter((l) => {
      const sameName =
        l.first_name.toLowerCase() === formData.first_name.toLowerCase() &&
        l.last_name.toLowerCase()  === formData.last_name.toLowerCase();
      const samePhone =
        normalizePhone(l.phone) === normalizePhone(formData.phone);
      const sameProperty =
        l.property_type === formData.property_type ||
        (formData.bedrooms && l.bedrooms != null && String(l.bedrooms) === String(formData.bedrooms));
      return sameName && samePhone && sameProperty;
    });
  } catch {
    return [];
  }
}

export default function AddListing() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [isLoading, setIsLoading]   = useState(false);
  const [duplicates, setDuplicates] = useState(null);   // array when modal open, null when closed
  const [pendingData, setPendingData] = useState(null);

  // ── Actual creation ──────────────────────────────────────────────────────────
  const doCreate = async (formData) => {
    setIsLoading(true);
    try {
      const created = await createAccommodation({
        ...formData,
        created_by_id:   user?.id   || null,
        created_by_name: user?.user_metadata?.full_name || user?.email || null,
      });
      navigate(`/listings/${created.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Form submit: check duplicates first ──────────────────────────────────────
  const handleSubmit = async (formData) => {
    const dupes = await findDuplicates(formData);
    if (dupes.length > 0) {
      setPendingData(formData);
      setDuplicates(dupes);
      return;
    }
    await doCreate(formData);
  };

  // ── Modal actions ────────────────────────────────────────────────────────────
  const handleProceed = async () => {
    const data = pendingData;
    setDuplicates(null);
    setPendingData(null);
    await doCreate(data);
  };

  const handleCancel = () => {
    setDuplicates(null);
    setPendingData(null);
  };

  const TYPE_MAP = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };

  return (
    <div className="animate-fade-in">

      {/* ── Duplicate warning modal ─────────────────────────────────────────── */}
      {duplicates && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        >
          <div className="card p-6 max-w-md w-full animate-slide-up">
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid rgba(251,191,36,0.3)' }}>
                <AlertTriangle size={19} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Possible Duplicate Detected
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  A landlord with matching details already exists in the system.
                </p>
              </div>
            </div>

            {/* Matching listings */}
            <div className="space-y-2 mb-5">
              {duplicates.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl p-3.5"
                  style={{ background: 'rgba(254,243,199,0.6)', border: '1px solid rgba(251,191,36,0.25)' }}
                >
                  <p className="text-sm font-bold text-slate-800">
                    {d.first_name} {d.last_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Home size={11} className="text-slate-400" />
                      {TYPE_MAP[d.property_type] || d.property_type}
                      {d.bedrooms ? ` · ${d.bedrooms} bed` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      {d.address}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary-600 mt-1.5">
                    €{Number(d.price).toLocaleString()}/mo
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Do you still want to add this as a new listing?
            </p>

            <div className="flex gap-2">
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Go Back
              </button>
              <button onClick={handleProceed} disabled={isLoading} className="btn-primary flex-1">
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </button>
        <h1 className="page-title">Add New Listing</h1>
        <p className="page-subtitle">Fill in the details to add a new accommodation to the database</p>
      </div>

      <AccommodationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
