import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ── Accommodations ────────────────────────────────────────────────────────────
export const getAccommodations = (params = {}) =>
  api.get('/accommodations', { params }).then((r) => r.data);

export const getAccommodation = (id) =>
  api.get(`/accommodations/${id}`).then((r) => r.data);

export const getStats = () =>
  api.get('/accommodations/stats').then((r) => r.data);

// image_urls = [{ storage_path, public_url, original_name }]
export const createAccommodation = (body) =>
  api.post('/accommodations', body).then((r) => r.data);

export const updateAccommodation = (id, body) =>
  api.put(`/accommodations/${id}`, body).then((r) => r.data);

export const deleteAccommodation = (id) =>
  api.delete(`/accommodations/${id}`).then((r) => r.data);

// ── Export ────────────────────────────────────────────────────────────────────
export const exportPdf = async (filters = {}) => {
  const response = await api.post('/export/pdf', { filters }, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const sendEmail = (payload) =>
  api.post('/export/email', payload).then((r) => r.data);
