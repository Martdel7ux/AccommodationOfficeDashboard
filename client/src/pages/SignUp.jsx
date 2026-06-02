import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options:  {
        data: { full_name: form.fullName.trim() },
      },
    });
    setLoading(false);

    if (err) return setError(err.message);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-8">
            <img src="/unic-logo.png" alt="UNIC" className="h-14 w-auto object-contain" />
          </div>
          <div className="bg-white rounded-2xl shadow-modal p-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Check your email inbox and click the confirmation link, then come back to sign in.
            </p>
            <Link to="/signin" className="btn-primary w-full justify-center py-3 text-base">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
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
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Join the Accommodation Office portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="form-input pl-9"
                  placeholder="Andreas Papadopoulos"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
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

            {/* Confirm password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pl-9"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  required
                />
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
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
