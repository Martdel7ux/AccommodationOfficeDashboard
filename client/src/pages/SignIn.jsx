import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo card */}
        <div className="flex justify-center mb-8">
          <img
            src="/unic-logo.png"
            alt="UNIC Accommodation Office"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-modal p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to the Accommodation Office portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3.5 py-3">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          University of Nicosia · Accommodation Office
        </p>
      </div>
    </div>
  );
}
