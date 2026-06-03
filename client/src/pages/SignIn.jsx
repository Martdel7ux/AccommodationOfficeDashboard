import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email:    form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (err) return setError(err.message);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: campus photo ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Photo */}
        <img
          src="/unic-campus.jpg"
          alt="University of Nicosia campus"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient overlay — dark at bottom, semi-transparent red tint overall */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-primary-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

        {/* Content on photo */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <img
            src="/unic-logo-white.png"
            alt="UNIC"
            className="h-10 w-auto object-contain object-left"
          />
          <p className="text-white text-2xl font-semibold leading-snug max-w-sm">
            The Off Campus Accommodation Database of the University of Nicosia
          </p>
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-[400px] animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/unic-logo.png" alt="UNIC" className="h-12 w-auto object-contain" />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Sign in to your accommodation office account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  className="form-input pl-9"
                  placeholder="you@unic.ac.cy"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pl-9 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[15px] mt-1 rounded-xl"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <ArrowRight size={17} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <p className="text-center text-xs text-slate-400">
            Access is restricted to authorised staff only.
            <br />Contact your administrator to request an account.</p>
          </p>

          <p className="text-center text-xs text-slate-300 mt-10">
            © {new Date().getFullYear()} University of Nicosia · Accommodation Office
          </p>
        </div>
      </div>
    </div>
  );
}
