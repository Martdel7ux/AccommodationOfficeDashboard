import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileDown, Mail, Loader2, Search, LayoutGrid, List, Pencil, Trash2, Sheet } from 'lucide-react';
import { getAccommodations, deleteAccommodation } from '../utils/api.js';
import { generateListingsPdf } from '../utils/exportPdf.js';
import { generateListingsExcel } from '../utils/exportExcel.js';
import FilterPanel from '../components/Listings/FilterPanel.jsx';
import ListingCard from '../components/Listings/ListingCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmailModal from '../components/Listings/EmailModal.jsx';
import { StatusBadge } from '../components/common/Badge.jsx';

const DEFAULT_FILTERS = {
  search: '', phone: '', status: 'all', property_type: '', bedrooms: '',
  min_price: 0, max_price: 2000, target_audience: 'all',
  walking_distance: false, availability_from: '', availability_to: '',
};

function buildApiParams(f) {
  const p = {};
  if (f.search)              p.search           = f.search;
  if (f.phone)               p.phone            = f.phone;
  if (f.status !== 'all')    p.status           = f.status;
  if (f.property_type)       p.property_type    = f.property_type;
  if (f.bedrooms)            p.bedrooms         = f.bedrooms;
  if (f.min_price > 0)       p.min_price        = f.min_price;
  if (f.max_price < 2000)    p.max_price        = f.max_price;
  if (f.target_audience !== 'all') p.target_audience = f.target_audience;
  if (f.walking_distance)    p.walking_distance = 'true';
  if (f.availability_from)   p.availability_from = f.availability_from;
  if (f.availability_to)     p.availability_to  = f.availability_to;
  return p;
}

// ── List row view ─────────────────────────────────────────────────────────────
function ListingRow({ listing: l, onDelete }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/listings/${l.id}`)}
    >
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
        {l.images?.[0] ? (
          <img src={l.images[0].public_url || `/uploads/${l.images[0].filename}`} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
            {l.property_type.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-900 capitalize">{l.property_type}</span>
          {l.bedrooms && <span className="text-xs text-slate-400">· {l.bedrooms} bed</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{l.address}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={l.availability_status} />
        <span className="text-sm font-bold text-slate-900 w-20 text-right">
          €{Number(l.price).toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 w-32 truncate">{l.first_name} {l.last_name}</span>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/listings/${l.id}/edit`)}
            className="btn-ghost btn-sm px-2"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => { if (window.confirm('Delete this listing?')) onDelete(l.id); }}
            className="btn-danger btn-sm px-2"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Listings() {
  const navigate = useNavigate();
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode]   = useState('grid');
  const debounceRef = useRef(null);

  const fetchListings = useCallback((f) => {
    setLoading(true);
    getAccommodations(buildApiParams(f))
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchListings(filters), 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchListings]);

  const handleDelete = async (id) => {
    await deleteAccommodation(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleExportPdf = async () => {
    setExporting(true);
    await generateListingsPdf(listings, filters).catch(console.error);
    setExporting(false);
  };

  const handleExportExcel = () => {
    generateListingsExcel(listings);
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Listings</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${listings.length} propert${listings.length !== 1 ? 'ies' : 'y'} found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exporting || listings.length === 0}
            className="btn-secondary"
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ffe4e6,#fecdd3)' }}>
              {exporting
                ? <Loader2 size={11} className="animate-spin" style={{ color: '#C41230' }} />
                : <FileDown size={11} style={{ color: '#C41230' }} />}
            </span>
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={listings.length === 0}
            className="btn-secondary"
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }}>
              <Sheet size={11} style={{ color: '#059669' }} />
            </span>
            Export Excel
          </button>
          <button
            onClick={() => setEmailOpen(true)}
            disabled={listings.length === 0}
            className="btn-secondary"
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' }}>
              <Mail size={11} style={{ color: '#2563eb' }} />
            </span>
            Email
          </button>
          <button onClick={() => navigate('/listings/new')} className="btn-primary">
            <Plus size={15} />
            Add Listing
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Filter sidebar */}
        <div className="w-60 flex-shrink-0">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">
              {!loading && `Showing ${listings.length} result${listings.length !== 1 ? 's' : ''}`}
            </p>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {loading && <LoadingSpinner text="Fetching listings…" />}

          {!loading && listings.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <Search size={32} className="text-slate-200" />
              <p className="text-slate-500 text-sm font-medium">No listings match your filters</p>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-secondary btn-sm">
                Clear filters
              </button>
            </div>
          )}

          {!loading && listings.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {!loading && listings.length > 0 && viewMode === 'list' && (
            <div className="card divide-y divide-slate-100">
              {listings.map((l) => (
                <ListingRow key={l.id} listing={l} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      <EmailModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        filters={buildApiParams(filters)}
        count={listings.length}
      />
    </div>
  );
}
