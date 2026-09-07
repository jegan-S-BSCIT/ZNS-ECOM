import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { resetPassword, isAdminSession } from '../lib/db';

const COPY = {
  login: {
    title: 'Welcome back',
    blurb: 'Sign in for your order history, saved formulations and addresses.'
  },
  signup: {
    title: 'Create an account',
    blurb: 'Saves your addresses and keeps your wishlist on every device.'
  },
  forgot: {
    title: 'Reset your password',
    blurb: 'We email a link that lets you set a new one.'
  }
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-[12px] text-slate-400">{hint}</span>}
    </label>
  );
}

export default function Login() {
  const { signInUser, signUpUser, showToast } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setResetSent(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const session = await signInUser(form.email, form.password);
      navigate(isAdminSession(session) ? '/admin' : next, { replace: true });
    } catch (err) {
      showToast(err.message || 'That email and password did not match.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      showToast('Use at least 8 characters for your password.', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('The two passwords do not match.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await signUpUser(form.name, form.email, form.password, form.phone);
      navigate(next, { replace: true });
    } catch (err) {
      showToast(err.message || 'Could not create the account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(form.email);
      setResetSent(true);
    } catch (err) {
      showToast(err.message || 'Could not send the reset email.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordInput = (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required
        value={form.password}
        onChange={set('password')}
        placeholder="••••••••"
        className="field pr-11"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-ink-800 transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          {showPassword ? (
            <path strokeLinecap="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.3A9.6 9.6 0 0112 5c5 0 9 4.5 9 7a12 12 0 01-2.4 3.4M6.2 6.7A12.4 12.4 0 003 12c0 2.5 4 7 9 7 1.3 0 2.5-.3 3.6-.8" />
          ) : (
            <>
              <path strokeLinecap="round" d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" />
              <circle cx="12" cy="12" r="2.6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-[78vh] grid lg:grid-cols-2">
      {/* Brand side — carries the same thesis as the home hero. */}
      <aside className="hidden lg:flex flex-col justify-between bg-ink-800 text-white p-12">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <span className="w-9 h-9 grid place-items-center rounded-lg bg-spruce-800 text-amber-500" aria-hidden="true">
            <svg viewBox="0 0 32 32" className="w-full h-full p-1.5" fill="none">
              <path d="M9 9h14L9 23h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold">Zen Nova</span>
        </Link>

        <div className="max-w-sm">
          <p className="eyebrow text-amber-500">Why an account</p>
          <h2 className="font-display text-3xl font-semibold leading-tight mt-4">
            Your routine, kept in one place.
          </h2>
          <ul className="mt-8 space-y-5">
            {[
              ['Order history', 'Every order, with live tracking through seven stages.'],
              ['Saved formulations', 'Your wishlist follows you between phone and desktop.'],
              ['Addresses on file', 'Checkout in one step instead of retyping a PIN code.']
            ].map(([title, body]) => (
              <li key={title} className="flex gap-4">
                <span className="w-px bg-amber-600 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-[14.5px] font-semibold">{title}</span>
                  <span className="block mt-1 text-[13.5px] text-white/55 leading-relaxed">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/30">
          Passwords are hashed. We never see them.
        </p>
      </aside>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 grid place-items-center rounded-lg bg-spruce-800 text-amber-500" aria-hidden="true">
              <svg viewBox="0 0 32 32" className="w-full h-full p-1.5" fill="none">
                <path d="M9 9h14L9 23h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
              </svg>
            </span>
            <span className="font-display text-xl font-semibold">Zen Nova</span>
          </Link>

          <h1 className="font-display text-3xl font-semibold">{COPY[mode].title}</h1>
          <p className="mt-2 text-[14px] text-slate-600">{COPY[mode].blurb}</p>

          {mode === 'login' && (
            <form onSubmit={handleSignIn} className="mt-8 space-y-5">
              <Field label="Email address">
                <input
                  type="email" required value={form.email} onChange={set('email')}
                  placeholder="you@example.com" className="field" autoComplete="email"
                />
              </Field>

              <div>
                <div className="flex items-center justify-between">
                  <span className="field-label mb-0">Password</span>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[12.5px] text-spruce-800 hover:underline mb-1.5"
                  >
                    Forgot it?
                  </button>
                </div>
                {passwordInput}
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="text-center text-[13.5px] text-slate-600">
                New here?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-semibold text-spruce-800 hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="mt-8 space-y-5">
              <Field label="Full name">
                <input type="text" required value={form.name} onChange={set('name')} className="field" autoComplete="name" />
              </Field>

              <Field label="Email address">
                <input
                  type="email" required value={form.email} onChange={set('email')}
                  placeholder="you@example.com" className="field" autoComplete="email"
                />
              </Field>

              <Field label="Mobile number" hint="Used for delivery updates. Optional.">
                <input
                  type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+91 98765 43210" className="field" autoComplete="tel"
                />
              </Field>

              <Field label="Password" hint="At least 8 characters.">
                {passwordInput}
              </Field>

              <Field label="Confirm password">
                <input
                  type="password" required value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="••••••••" className="field" autoComplete="new-password"
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <p className="text-center text-[13.5px] text-slate-600">
                Already have one?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-semibold text-spruce-800 hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleReset} className="mt-8 space-y-5">
              {resetSent ? (
                <div className="rounded-xl border border-spruce-600/30 bg-spruce-50 p-5">
                  <p className="text-[14px] text-slate-700">
                    A reset link is on its way to{' '}
                    <span className="font-mono font-medium text-ink-800">{form.email}</span>. It expires in an hour.
                  </p>
                </div>
              ) : (
                <>
                  <Field label="Registered email address">
                    <input
                      type="email" required value={form.email} onChange={set('email')}
                      placeholder="you@example.com" className="field" autoComplete="email"
                    />
                  </Field>
                  <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                    {submitting ? 'Sending…' : 'Send reset link'}
                  </button>
                </>
              )}

              <p className="text-center">
                <button type="button" onClick={() => switchMode('login')} className="text-[13.5px] text-slate-600 hover:underline">
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-rule">
            <Link to="/shop" className="btn btn-ghost w-full">Keep browsing as a guest</Link>
            <p className="mt-3 text-center text-[12px] text-slate-400">
              Guest checkout is always available. An account just saves the typing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
