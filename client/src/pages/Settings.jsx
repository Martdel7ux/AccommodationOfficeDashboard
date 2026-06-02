import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, LogOut, Trash2,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// ── Reusable section card ─────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={15} className="text-slate-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Inline feedback ───────────────────────────────────────────────────────────
function Feedback({ type, message }) {
  if (!message) return null;
  return (
    <div className={`flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 mt-3 ${
      type === 'success'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        : 'bg-red-50 text-red-600 border border-red-100'
    }`}>
      {type === 'success'
        ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
        : <AlertCircle  size={14} className="mt-0.5 flex-shrink-0" />}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate   = useNavigate();
  const { user, signOut } = useAuth();

  const currentName = user?.user_metadata?.full_name || '';

  // ── Profile state ──────────────────────────────────────────────────────────
  const [name, setName]           = useState(currentName);
  const [nameLoading, setNL]      = useState(false);
  const [nameFeedback, setNF]     = useState({ type: '', msg: '' });

  // ── Password state ─────────────────────────────────────────────────────────
  const [pw, setPw]               = useState({ new: '', confirm: '' });
  const [showPw, setShowPw]       = useState(false);
  const [pwLoading, setPwL]       = useState(false);
  const [pwFeedback, setPwF]      = useState({ type: '', msg: '' });

  // ── Delete state ───────────────────────────────────────────────────────────
  const [deleteConfirm, setDC]    = useState('');
  const [deleteLoading, setDL]    = useState(false);
  const [deleteFeedback, setDF]   = useState({ type: '', msg: '' });

  // ── Update name ────────────────────────────────────────────────────────────
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNL(true);
    setNF({ type: '', msg: '' });
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setNL(false);
    if (error) return setNF({ type: 'error', msg: error.message });
    setNF({ type: 'success', msg: 'Display name updated successfully.' });
  };

  // ── Update password ────────────────────────────────────────────────────────
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwF({ type: '', msg: '' });
    if (pw.new !== pw.confirm) return setPwF({ type: 'error', msg: 'Passwords do not match.' });
    if (pw.new.length < 6)     return setPwF({ type: 'error', msg: 'Password must be at least 6 characters.' });
    setPwL(true);
    const { error } = await supabase.auth.updateUser({ password: pw.new });
    setPwL(false);
    if (error) return setPwF({ type: 'error', msg: error.message });
    setPwF({ type: 'success', msg: 'Password updated successfully.' });
    setPw({ new: '', confirm: '' });
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') {
      return setDF({ type: 'error', msg: 'Type DELETE exactly to confirm.' });
    }
    setDL(true);
    setDF({ type: '', msg: '' });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/user/delete', {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await signOut();
      navigate('/signin');
    } catch (err) {
      setDL(false);
      setDF({ type: 'error', msg: err.message || 'Failed to delete account.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your profile and account preferences</p>
      </div>

      <div className="space-y-4">

        {/* ── Profile ─────────────────────────────────────────────────────── */}
        <Section
          icon={User}
          title="Display Name"
          subtitle="This name is shown in the sidebar and on emails sent to students"
        >
          <form onSubmit={handleUpdateName} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <button type="submit" disabled={nameLoading || name === currentName} className="btn-primary">
              {nameLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {nameLoading ? 'Saving…' : 'Save'}
            </button>
          </form>
          <Feedback type={nameFeedback.type} message={nameFeedback.msg} />

          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="form-label">Email Address</label>
            <p className="text-sm text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
              {user?.email}
            </p>
            <p className="form-hint">Email address cannot be changed.</p>
          </div>
        </Section>

        {/* ── Password ────────────────────────────────────────────────────── */}
        <Section
          icon={Lock}
          title="Change Password"
          subtitle="Use a strong password of at least 6 characters"
        >
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Min. 6 characters"
                  value={pw.new}
                  onChange={(e) => setPw((p) => ({ ...p, new: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat new password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            <Feedback type={pwFeedback.type} message={pwFeedback.msg} />
            <div className="pt-1">
              <button type="submit" disabled={pwLoading} className="btn-primary">
                {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </Section>

        {/* ── Sign out ─────────────────────────────────────────────────────── */}
        <Section
          icon={LogOut}
          title="Sign Out"
          subtitle="Sign out of this device"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{user?.email}</span>
            </p>
            <button onClick={handleSignOut} className="btn-secondary">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </Section>

        {/* ── Danger zone ──────────────────────────────────────────────────── */}
        <div className="card border-red-200 overflow-hidden">
          <div className="flex items-start gap-3 px-6 py-5 border-b border-red-100 bg-red-50">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trash2 size={15} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-red-700">Delete Account</h2>
              <p className="text-xs text-red-400 mt-0.5">This action is permanent and cannot be undone</p>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-slate-600 mb-4">
              Deleting your account will permanently remove your access to the system.
              All your session data will be erased. The accommodation listings you have added
              will <span className="font-semibold">not</span> be deleted.
            </p>
            <div className="mb-3">
              <label className="form-label">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                className="form-input border-red-200 focus:ring-red-400"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={(e) => setDC(e.target.value)}
              />
            </div>
            <Feedback type={deleteFeedback.type} message={deleteFeedback.msg} />
            <div className="mt-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                className="btn-danger"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? 'Deleting…' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
