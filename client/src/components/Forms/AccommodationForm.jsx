import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Home, Image, CheckCircle2, ChevronRight, Loader2, AlertCircle,
  Building2, BedDouble, DoorOpen,
} from 'lucide-react';
import ImageUpload from '../common/ImageUpload.jsx';

const STEPS = [
  { id: 1, label: 'Landlord',  icon: User },
  { id: 2, label: 'Property',  icon: Home },
  { id: 3, label: 'Media',     icon: Image },
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'studio',    label: 'Studio',    icon: BedDouble  },
  { value: 'house',     label: 'House',     icon: Home       },
  { value: 'room',      label: 'Room',      icon: DoorOpen   },
];

const BEDROOMS = [1, 2, 3, 4];

const AUDIENCES = [
  { value: 'full-time', label: 'Full-time Students', desc: 'For regular degree students' },
  { value: 'erasmus',   label: 'Erasmus Students',   desc: 'For exchange programme students' },
  { value: 'both',      label: 'All Students',        desc: 'Open to everyone' },
];

export default function AccommodationForm({ initialData, onSubmit, isLoading }) {
  const [step, setStep]                   = useState(1);
  const [newFiles, setNewFiles]           = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [serverError, setServerError]     = useState('');

  const existingImages = (initialData?.images || []).filter(
    (img) => !deletedImages.includes(img.id)
  );

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      first_name:          initialData?.first_name          || '',
      last_name:           initialData?.last_name           || '',
      phone:               initialData?.phone               || '',
      email:               initialData?.email               || '',
      property_type:       initialData?.property_type       || 'apartment',
      bedrooms:            initialData?.bedrooms             || '',
      price:               initialData?.price               || '',
      address:             initialData?.address             || '',
      availability_date:   initialData?.availability_date   || '',
      availability_status: initialData?.availability_status || 'available',
      target_audience:     initialData?.target_audience     || 'both',
      furnishing_status:   initialData?.furnishing_status   || 'fully-furnished',
      walking_distance:    initialData?.walking_distance     ? 'true' : 'false',
      description:         initialData?.description         || '',
    },
  });

  const watchedType     = watch('property_type');
  const watchedBedrooms = watch('bedrooms');
  const watchedStatus   = watch('availability_status');
  const watchedAudience = watch('target_audience');
  const watchedFurnish  = watch('furnishing_status');
  const watchedWalk     = watch('walking_distance');

  const STEP_FIELDS = {
    1: ['first_name', 'last_name', 'phone', 'email'],
    2: ['property_type', 'price', 'address', 'availability_status'],
  };

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const handleFormSubmit = async (data) => {
    setServerError('');
    const body = {
      ...data,
      image_urls:      newFiles,        // [{ storage_path, public_url, original_name }]
      delete_image_ids: deletedImages,  // [id, id, ...]
    };
    try {
      await onSubmit(body);
    } catch (err) {
      setServerError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const done    = step > s.id;
          const current = step === s.id;
          const Icon    = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => done && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${current ? 'bg-primary-600 text-white shadow-sm'
                  : done    ? 'text-primary-600 hover:bg-primary-50 cursor-pointer'
                  :           'text-slate-400 cursor-default'
                  }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${current ? 'bg-white/20' : done ? 'bg-primary-100' : 'bg-slate-100'}
                `}>
                  {done ? <CheckCircle2 size={12} className="text-primary-600" /> : <Icon size={12} />}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-slate-300 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* ── STEP 1: Landlord ───────────────────────────────────────── */}
        {step === 1 && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Landlord Information</h2>
              <p className="text-sm text-slate-400 mt-0.5">Contact details of the property owner</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  {...register('first_name', { required: 'Required' })}
                  className={`form-input ${errors.first_name ? 'error' : ''}`}
                  placeholder="Andreas"
                />
                {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  {...register('last_name', { required: 'Required' })}
                  className={`form-input ${errors.last_name ? 'error' : ''}`}
                  placeholder="Papadopoulos"
                />
                {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Phone Number *</label>
              <input
                {...register('phone', {
                  required: 'Required',
                  pattern: { value: /^[+\d\s().-]{7,20}$/, message: 'Invalid phone number' },
                })}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+357 99 123456"
                type="tel"
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                {...register('email', {
                  required: 'Required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="landlord@example.com"
                type="email"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={goNext} className="btn-primary">
                Next: Property Details <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Property ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Property Details</h2>
              <p className="text-sm text-slate-400 mt-0.5">Information about the accommodation</p>
            </div>

            {/* Property type */}
            <div>
              <label className="form-label">Property Type *</label>
              <div className="grid grid-cols-4 gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue('property_type', t.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all
                      ${watchedType === t.value
                        ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <t.icon
                      size={20}
                      className={watchedType === t.value ? 'text-primary-600' : 'text-slate-400'}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms (not for studio) */}
            {watchedType !== 'studio' && (
              <div>
                <label className="form-label">Number of Bedrooms</label>
                <div className="flex gap-2">
                  {BEDROOMS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setValue('bedrooms', watchedBedrooms == b ? '' : b)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                        ${watchedBedrooms == b
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="form-label">Monthly Rent (EUR) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">€</span>
                <input
                  {...register('price', {
                    required: 'Required',
                    min: { value: 1, message: 'Must be a positive number' },
                    valueAsNumber: true,
                  })}
                  className={`form-input pl-7 ${errors.price ? 'error' : ''}`}
                  type="number"
                  min="1"
                  step="10"
                  placeholder="650"
                />
              </div>
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="form-label">Full Address *</label>
              <input
                {...register('address', { required: 'Required' })}
                className={`form-input ${errors.address ? 'error' : ''}`}
                placeholder="14 Makarios Avenue, Nicosia 1065"
              />
              {errors.address && <p className="form-error">{errors.address.message}</p>}
            </div>

            {/* Availability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Available From</label>
                <input
                  {...register('availability_date')}
                  className="form-input"
                  type="date"
                />
              </div>
              <div>
                <label className="form-label">Availability Status *</label>
                <div className="flex gap-2">
                  {['available', 'unavailable'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('availability_status', s)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all capitalize
                        ${watchedStatus === s
                          ? s === 'available'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300'
                            : 'border-red-400 bg-red-50 text-red-600 ring-1 ring-red-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target audience */}
            <div>
              <label className="form-label">Target Audience</label>
              <div className="space-y-2">
                {AUDIENCES.map((a) => (
                  <label
                    key={a.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${watchedAudience === a.value
                        ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={a.value}
                      checked={watchedAudience === a.value}
                      onChange={() => setValue('target_audience', a.value)}
                      className="text-primary-600 accent-primary-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{a.label}</p>
                      <p className="text-xs text-slate-400">{a.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="form-label">Furnishing Status</label>
              <div className="flex gap-2">
                {['fully-furnished', 'semi-furnished'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setValue('furnishing_status', f)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${watchedFurnish === f
                        ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {f === 'fully-furnished' ? 'Fully Furnished' : 'Semi-Furnished'}
                  </button>
                ))}
              </div>
            </div>

            {/* Walking distance */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Walking distance to university</p>
                <p className="text-xs text-slate-400 mt-0.5">Within 15 minutes on foot</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={watchedWalk === 'true'}
                onClick={() => setValue('walking_distance', watchedWalk === 'true' ? 'false' : 'true')}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 ${
                  watchedWalk === 'true' ? 'bg-primary-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    watchedWalk === 'true' ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button type="button" onClick={goNext} className="btn-primary">
                Next: Photos <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Media & Description ───────────────────────────── */}
        {step === 3 && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Photos & Description</h2>
              <p className="text-sm text-slate-400 mt-0.5">Add images and a description to attract students</p>
            </div>

            <div>
              <label className="form-label">Property Photos</label>
              <ImageUpload
                onFilesChange={setNewFiles}
                existingImages={existingImages}
                onDeleteExisting={(id) => setDeletedImages((prev) => [...prev, id])}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                {...register('description')}
                className="form-input resize-none"
                rows={5}
                placeholder="Describe the property — location highlights, included amenities, rules, nearby transport, etc."
              />
              <p className="form-hint">Helpful details increase interest from students</p>
            </div>

            {serverError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {serverError}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary btn-lg">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isLoading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
