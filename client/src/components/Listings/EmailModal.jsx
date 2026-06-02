import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import { sendEmail } from '../../utils/api.js';

export default function EmailModal({ isOpen, onClose, filters, count }) {
  const [form, setForm]     = useState({ to: '', subject: 'UNIC Accommodation Listings', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError]   = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSend = async () => {
    if (!form.to.trim()) return;
    setStatus('sending');
    setError('');
    try {
      await sendEmail({ ...form, filters });
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setForm({ to: '', subject: 'UNIC Accommodation Listings', message: '' });
        onClose();
      }, 1800);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send email. Check SMTP settings.');
      setStatus('error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Listings" size="md">
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Email sent successfully!</p>
          <p className="text-xs text-slate-400">{count} listing{count !== 1 ? 's' : ''} included</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-lg px-3 py-2 text-xs text-primary-700">
            Will send <strong>{count}</strong> listing{count !== 1 ? 's' : ''} matching current filters
          </div>

          <div>
            <label className="form-label">Recipient Email *</label>
            <input
              type="email"
              className="form-input"
              placeholder="student@example.com"
              value={form.to}
              onChange={(e) => set('to', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Message (optional)</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="Add a personal message…"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
            />
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleSend}
              disabled={!form.to.trim() || status === 'sending'}
              className="btn-primary flex-1"
            >
              {status === 'sending' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {status === 'sending' ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
