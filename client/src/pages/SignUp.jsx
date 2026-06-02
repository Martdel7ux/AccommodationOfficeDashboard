import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters.');

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options:  { data: { full_name: form.fullName.trim() } },
    });
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: campus photo ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        <img
          src="/unic-campus.jpg"
          alt="University of Nicosia campus"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-primary-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

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

          {success ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You're all set!</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Check your email inbox and click the confirmation link to activate your account, then come back to sign in.
              </p>
              <Link
                to="/signin"
                className="btn-primary w-full justify-center py-3 text-[15px] rounded-xl"
              >
                <ArrowRight size={17} />
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* ── Heading ── */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
                <p className="text-slate-500 text-sm mt-1.5">
                  Join the Accommodation Office portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                  <label className="form-label">Work Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}

          <p className="text-center text-xs text-slate-300 mt-10">
            © {new Date().getFullYear()} University of Nicosia · Accommodation Office
          </p>
        </div>
      </div>
    </div>
  );
}
