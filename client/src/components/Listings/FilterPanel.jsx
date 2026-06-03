import { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Phone } from 'lucide-react';

const TYPES     = ['apartment', 'studio', 'house', 'room'];
const BEDROOMS  = [1, 2, 3, 4];
const AUDIENCES = [
  { value: 'all',       label: 'All' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'erasmus',   label: 'Erasmus' },
];

const DEFAULT_FILTERS = {
  search: '', phone: '', status: 'all', property_type: '', bedrooms: '',
  min_price: 0, max_price: 2000, target_audience: 'all',
  walking_distance: false, availability_from: '', availability_to: '',
};

export default function FilterPanel({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const hasActive = Object.keys(DEFAULT_FILTERS).some((k) => {
    if (k === 'max_price') return filters[k] !== 2000;
    if (k === 'min_price') return filters[k] !== 0;
    return filters[k] !== DEFAULT_FILTERS[k];
  });

  return (
    <div className="card p-5 space-y-5 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={15} />
          Filters
        </div>
        {hasActive && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="form-label">Search</label>
        <div className="relative">
          <input
            type="text"
            className="form-input pr-8"
            placeholder="Address, landlord…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => set('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Phone number */}
      <div>
        <label className="form-label">Phone Number</label>
        <div className="relative">
          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="tel"
            className="form-input pl-8 pr-8"
            placeholder="+357 99…"
            value={filters.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          {filters.phone && (
            <button
              onClick={() => set('phone', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="form-label">Availability</label>
        <div className="flex gap-1.5">
          {['all', 'available', 'unavailable'].map((s) => (
            <button
              key={s}
              onClick={() => set('status', s)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                filters.status === s
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div>
        <label className="form-label">Property Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => set('property_type', '')}
            className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
              !filters.property_type
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}
          >
            All Types
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => set('property_type', filters.property_type === t ? '' : t)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                filters.property_type === t
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="form-label">Bedrooms</label>
        <div className="flex gap-1.5">
          <button
            onClick={() => set('bedrooms', '')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              !filters.bedrooms
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}
          >
            Any
          </button>
          {BEDROOMS.map((b) => (
            <button
              key={b}
              onClick={() => set('bedrooms', filters.bedrooms == b ? '' : b)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filters.bedrooms == b
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Price Range</label>
          <span className="text-xs font-semibold text-primary-600">
            €{filters.min_price} – €{filters.max_price}
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-slate-400 mb-1">Min</p>
            <input
              type="range" min={0} max={2000} step={50}
              value={filters.min_price}
              onChange={(e) => set('min_price', Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#C41230' }}
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 mb-1">Max</p>
            <input
              type="range" min={0} max={2000} step={50}
              value={filters.max_price}
              onChange={(e) => set('max_price', Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#C41230' }}
            />
          </div>
        </div>
      </div>

      {/* Target audience */}
      <div>
        <label className="form-label">Target Audience</label>
        <div className="flex gap-1.5">
          {AUDIENCES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set('target_audience', value)}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-medium border transition-all ${
                filters.target_audience === value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Walking distance */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-600 font-medium cursor-pointer select-none">
          Walking distance only
        </label>
        <button
          role="switch"
          aria-checked={filters.walking_distance}
          onClick={() => set('walking_distance', !filters.walking_distance)}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 ${
            filters.walking_distance ? 'bg-primary-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              filters.walking_distance ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Availability date range */}
      <div>
        <label className="form-label">Available From / To</label>
        <div className="space-y-1.5">
          <input
            type="date"
            className="form-input"
            value={filters.availability_from}
            onChange={(e) => set('availability_from', e.target.value)}
          />
          <input
            type="date"
            className="form-input"
            value={filters.availability_to}
            onChange={(e) => set('availability_to', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
