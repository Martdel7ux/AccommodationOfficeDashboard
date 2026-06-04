import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Supabase returns the related table as `accommodation_images`; normalise to `images`
const normalizeImages = (acc) => {
  if (!acc) return acc;
  const { accommodation_images, ...rest } = acc;
  return { ...rest, images: accommodation_images ?? [] };
};

// ── Accommodations ────────────────────────────────────────────────────────────
export const getAccommodations = (params = {}) =>
  api.get('/accommodations', { params }).then((r) => r.data.map(normalizeImages));

export const getAccommodation = (id) =>
  api.get(`/accommodations/${id}`).then((r) => normalizeImages(r.data));

export const getStats = () =>
  api.get('/accommodations/stats').then((r) => r.data);

// image_urls = [{ storage_path, public_url, original_name }]
export const createAccommodation = (body) =>
  api.post('/accommodations', body).then((r) => normalizeImages(r.data));

export const updateAccommodation = (id, body) =>
  api.put(`/accommodations/${id}`, body).then((r) => normalizeImages(r.data));

export const deleteAccommodation = (id) =>
  api.delete(`/accommodations/${id}`).then((r) => r.data);

export const sendEmail = (payload) =>
  api.post('/export/email', payload).then((r) => r.data);


// ── Flatmates ─────────────────────────────────────────────────────────────────
export const getFlatmates    = (params = {}) =>
  api.get('/flatmates', { params }).then((r) => r.data);

export const createFlatmate  = (body) =>
  api.post('/flatmates', body).then((r) => r.data);

export const deleteFlatmate  = (id) =>
  api.delete(`/flatmates/${id}`).then((r) => r.data);
