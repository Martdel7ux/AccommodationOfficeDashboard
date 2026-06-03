import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, X, Trash2, Phone, Mail, BookOpen,
  Home, UserSearch, Loader2, AlertCircle, ChevronDown,
} from 'lucide-react';
import { getFlatmates, createFlatmate, deleteFlatmate } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Modal from '../components/common/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Masters', 'PhD', 'Other'];
const GENDERS = [
  { value: 'male',               label: 'Male' },
  { value: 'female',             label: 'Female' },
  { value: 'prefer_not_to_say',  label: 'Prefer not to say' },
];

const GENDER_LABEL = {
  male: 'Male', female: 'Female', prefer_not_to_say: 'Undisclosed',
};

// ── Student card ──────────────────────────────────────────────────────────────
function StudentCard({ student: s, onDelete }) {
  const { t } = useLanguage();
  const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();
  const hasFlat  = s.has_flat;

  return (
    <div
      className="card p-5 flex flex-col gap-3 transition-all duration-300"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Coloured top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
        background: hasFlat
          ? 'linear-gradient(90deg,#10b981,#34d399)'
          : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
      }} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white"
            style={{ background: hasFlat ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#2563eb,#3b82f6)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {s.first_name} {s.last_name}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
              style={hasFlat
                ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                : { background: 'rgba(59,130,246,0.12)', color: '#2563eb' }}
            >
              {hasFlat ? <Home size={9} /> : <UserSearch size={9} />}
              {hasFlat ? t('flatmates.hasFlat') : t('flatmates.lookingForFlat')}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(s.id)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
          style={{ background: 'rgba(148,163,184,0.08)' }}
          title="Remove"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <a
          href={`tel:${s.phone}`}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary-600 transition-colors"
        >
          <Phone size={11} className="text-slate-400 flex-shrink-0" />
          {s.phone}
        </a>
        {s.email && (
          <a
            href={`mailto:${s.email}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary-600 transition-colors truncate"
          >
            <Mail size={11} className="text-slate-400 flex-shrink-0" />
            {s.email}
          </a>
        )}
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5">
        {s.year_of_study && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
            <BookOpen size={9} /> {s.year_of_study}
          </span>
        )}
        {s.gender && s.gender !== 'prefer_not_to_say' && (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full capitalize">
            {GENDER_LABEL[s.gender] || s.gender}
          </span>
        )}
      </div>

      {/* Notes */}
      {s.notes && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 border-t border-slate-100/60 pt-2">
          {s.notes}
        </p>
      )}

      {/* Footer */}
      {s.created_by_name && (
        <p className="text-[10px] text-slate-300 border-t border-slate-100/60 pt-2">
          {t('flatmates.addedBy')} <span className="font-medium text-slate-400">{s.created_by_name}</span>
          {' · '}{new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}

// ── Add Student Modal ─────────────────────────────────────────────────────────
function AddStudentModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const empty = {
    first_name: '', last_name: '', phone: '', email: '',
    year_of_study: '', gender: 'prefer_not_to_say', has_flat: 'false', notes: '',
  };
  const [form, setForm]       = useState(empty);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [serverErr, setServerErr] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (!form.phone.trim())      e.phone      = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setServerErr('');
    try {
      const created = await createFlatmate({
        ...form,
        has_flat:        form.has_flat === 'true',
        created_by_id:   user?.id   || null,
        created_by_name: user?.user_metadata?.full_name || user?.email || null,
      });
      onCreated(created);
      setForm(empty);
      onClose();
    } catch (err) {
      setServerErr(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { setForm(empty); setErrors({}); setServerErr(''); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('flatmates.addTitle')} size="md">
      <div className="space-y-4">

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">{t('flatmates.firstName')} *</label>
            <input className={`form-input ${errors.first_name ? 'error' : ''}`}
              placeholder="Maria" value={form.first_name}
              onChange={(e) => set('first_name', e.target.value)} />
            {errors.first_name && <p className="form-error">{errors.first_name}</p>}
          </div>
          <div>
            <label className="form-label">{t('flatmates.lastName')} *</label>
            <input className={`form-input ${errors.last_name ? 'error' : ''}`}
              placeholder="Georgiou" value={form.last_name}
              onChange={(e) => set('last_name', e.target.value)} />
            {errors.last_name && <p className="form-error">{errors.last_name}</p>}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="form-label">{t('flatmates.phone')} *</label>
          <input className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="+357 99 123456" type="tel" value={form.phone}
            onChange={(e) => set('phone', e.target.value)} />
          {errors.phone && <p className="form-error">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="form-label">{t('flatmates.email')}</label>
          <input className="form-input" placeholder={`student@unic.ac.cy ${t('common.optional')}`}
            type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)} />
        </div>

        {/* Year + Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">{t('flatmates.year')}</label>
            <div className="relative">
              <select
                className="form-input appearance-none pr-8"
                value={form.year_of_study}
                onChange={(e) => set('year_of_study', e.target.value)}
              >
                <option value="">{t('flatmates.selectYear')}</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="form-label">{t('flatmates.gender')}</label>
            <div className="relative">
              <select
                className="form-input appearance-none pr-8"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Has flat */}
        <div>
          <label className="form-label">{t('flatmates.status')} *</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'true',  icon: Home,       label: t('flatmates.hasAFlat'),    sub: t('flatmates.hasAFlatSub'),   color: 'emerald' },
              { value: 'false', icon: UserSearch, label: t('flatmates.lookingFlat'),  sub: t('flatmates.lookingFlatSub'), color: 'blue' },
            ].map(({ value, icon: Icon, label, sub, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('has_flat', value)}
                className="flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all"
                style={form.has_flat === value
                  ? { background: color === 'emerald' ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)', borderColor: color === 'emerald' ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)', boxShadow: `0 0 0 1px ${color === 'emerald' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}` }
                  : { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(203,213,225,0.5)' }
                }
              >
                <Icon size={15} style={{ color: form.has_flat === value ? (color === 'emerald' ? '#059669' : '#2563eb') : '#94a3b8' }} />
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                <p className="text-[10px] text-slate-400">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="form-label">{t('flatmates.notes')}</label>
          <textarea className="form-input resize-none" rows={2}
            placeholder={t('flatmates.notesPlaceholder')}
            value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {serverErr && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" /> {serverErr}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={handleClose} className="btn-secondary flex-1">{t('flatmates.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? t('flatmates.saving') : t('flatmates.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Flatmates() {
  const { t } = useLanguage();
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');       // 'all' | 'has_flat' | 'looking'
  const [search, setSearch]       = useState('');
  const [gender, setGender]       = useState('all');
  const [year, setYear]           = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab === 'has_flat') params.has_flat = 'true';
      if (tab === 'looking')  params.has_flat = 'false';
      if (search.trim())      params.search   = search.trim();
      if (gender !== 'all')   params.gender   = gender;
      if (year   !== 'all')   params.year_of_study = year;
      setStudents(await getFlatmates(params));
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, gender, year]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 250);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student from the flatmate list?')) return;
    await deleteFlatmate(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreated = (s) => setStudents((prev) => [s, ...prev]);

  const hasFlat  = students.filter((s) => s.has_flat).length;
  const looking  = students.filter((s) => !s.has_flat).length;

  const TABS = [
    { key: 'all',      label: t('flatmates.allStudents'),    count: students.length },
    { key: 'has_flat', label: t('flatmates.hasFlat'),        count: hasFlat },
    { key: 'looking',  label: t('flatmates.lookingForFlat'), count: looking },
  ];

  return (
    <div className="animate-fade-in">
      <AddStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users size={22} className="text-primary-600" />
            {t('flatmates.title')}
          </h1>
          <p className="page-subtitle">{t('flatmates.subtitle')}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={15} /> {t('flatmates.addStudent')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)' }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={tab === key
              ? { background: 'rgba(255,255,255,0.95)', color: '#C41230', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontWeight: 600 }
              : { color: '#64748b' }
            }
          >
            {label}
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
              style={tab === key
                ? { background: 'rgba(196,18,48,0.1)', color: '#C41230' }
                : { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
              }
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="form-input pl-8 pr-8"
            placeholder={t('flatmates.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Gender filter */}
        <div className="relative">
          <select
            className="form-input pr-8 appearance-none text-sm"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ minWidth: 130 }}
          >
            <option value="all">{t('flatmates.allGenders')}</option>
            <option value="male">{t('flatmates.male')}</option>
            <option value="female">{t('flatmates.female')}</option>
            <option value="prefer_not_to_say">{t('flatmates.preferNot')}</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Year filter */}
        <div className="relative">
          <select
            className="form-input pr-8 appearance-none text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ minWidth: 130 }}
          >
            <option value="all">{t('flatmates.allYears')}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {(search || gender !== 'all' || year !== 'all') && (
          <button
            onClick={() => { setSearch(''); setGender('all'); setYear('all'); }}
            className="text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Loading students…" />
      ) : students.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(148,163,184,0.1)' }}>
            <Users size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">{t('flatmates.noStudents')}</p>
          <button onClick={() => setModalOpen(true)} className="btn-secondary btn-sm mt-1">
            <Plus size={13} /> {t('flatmates.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((s) => (
            <StudentCard key={s.id} student={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
