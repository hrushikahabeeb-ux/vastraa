import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuthStore, useUIStore } from '../store';
import { Logo, Icon, Spinner } from '../components/shared';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function Login() {
  const nav = useNavigate();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setAuth(res.user, res.token);
      showToast(`Welcome back, ${res.user.firstName}!`);
      nav('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    const demo = {
      firstName: 'Vastra',
      lastName: 'Demo',
      email: 'demo@vastra.com',
      phone: '9876543210',
      password: 'vastra123',
      confirmPassword: 'vastra123',
    };

    setLoading(true);
    setError('');
    try {
      try {
        await authAPI.signup(demo);
      } catch {}
      const res = await authAPI.login({ email: demo.email, password: demo.password });
      setAuth(res.user, res.token);
      showToast('Logged in instantly ✨');
      nav('/');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px 32px' }}>
      <div style={{ marginBottom: 12 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Logo size="lg" />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginTop: 20 }}>Log In</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Welcome back to Vastra</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="form-input-icon">
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input className="form-input" style={{ paddingLeft: 44 }} type="email" placeholder="Enter your email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
        </div>

        <div className="form-group">
          <div className="flex-between"><label className="form-label">Password</label>
            <button type="button" style={{ fontSize: 12, color: 'var(--teal-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="form-input" style={{ paddingRight: 44 }} type={showPw ? 'text' : 'password'} placeholder="Enter password"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {error && <div className="form-error" style={{ textAlign: 'center', padding: '8px', background: '#fef0f0', borderRadius: 8 }}>{error}</div>}

        <button className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} type="submit" style={{ marginTop: 8 }}>
          {loading ? <Spinner size={20} /> : 'Log In'}
        </button>

        <button type="button" className="btn btn-outline btn-full" onClick={quickDemoLogin}>
          Quick demo login
        </button>
      </form>

      <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>You can also use phone OTP for a faster login.</div>

      <div className="divider-text" style={{ marginTop: 24 }}>or continue with</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        {['G', 'f'].map((s, i) => (
          <button key={i} style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface)', fontWeight: 700, fontSize: 18, color: ['#EA4335', '#1877F2'][i], cursor: 'pointer' }}>{s}</button>
        ))}
        <button style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}
          onClick={() => nav('/otp')}>OTP</button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, color: 'var(--muted)', fontSize: 14 }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--teal-dark)', fontWeight: 600 }}>Sign Up</Link>
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export function Signup() {
  const nav = useNavigate();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.signup(form);
      setAuth(res.user, res.token);
      showToast('Account created! Welcome to Vastra 🎉');
      nav('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: (e) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 32px' }}>
      <div style={{ marginBottom: 8 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Logo size="lg" />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginTop: 20 }}>Create Account</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Explore our curated collection of stylish clothing</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First name</label>
            <input className="form-input" placeholder="First name" {...f('firstName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Last name</label>
            <input className="form-input" placeholder="Last name" {...f('lastName')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Mobile number & email</label>
          <input className="form-input" type="tel" placeholder="+91 Mobile number" {...f('phone')} />
        </div>
        <div className="form-group">
          <input className="form-input" type="email" placeholder="Email address" {...f('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Create password" {...f('password')} required />
        </div>
        <div className="form-group">
          <input className="form-input" type="password" placeholder="Confirm password" {...f('confirmPassword')} required />
        </div>

        {error && <div className="form-error" style={{ textAlign: 'center', padding: '8px', background: '#fef0f0', borderRadius: 8 }}>{error}</div>}

        <button className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} type="submit" style={{ marginTop: 4 }}>
          {loading ? <Spinner size={20} /> : 'Sign Up'}
        </button>
      </form>

      <div className="divider-text" style={{ marginTop: 20 }}>or sign up with</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        {['G', 'f'].map((s, i) => (
          <button key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface)', fontWeight: 700, fontSize: 17, color: ['#EA4335', '#1877F2'][i], cursor: 'pointer' }}>{s}</button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 14 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--teal-dark)', fontWeight: 600 }}>Log In</Link>
      </div>
    </div>
  );
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
export function OTP() {
  const nav = useNavigate();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState('phone'); // phone | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const sendOtp = async () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.sendOtp(phone);
      if (res.otp) setDevOtp(res.otp); // dev mode
      setStep('otp');
      showToast('OTP sent to ' + phone);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 4) { setError('Enter the 4-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.verifyOtp(phone, code);
      setAuth(res.user, res.token);
      showToast('Verified! Welcome to Vastra');
      nav('/');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, var(--teal-xlight) 0%, var(--surface) 50%)' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <button className="btn btn-icon btn-ghost" onClick={() => step === 'otp' ? setStep('phone') : nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.62 2 2 0 0 1 3.62 1.44h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>OTP Verification</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          {step === 'phone' ? 'Enter your mobile number to receive an OTP' : `Enter the 4-digit code sent to +91 ${phone}`}
        </div>

        {step === 'phone' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
              <span style={{ padding: '13px 14px', borderRight: '1.5px solid var(--border)', color: 'var(--muted)', fontSize: 15 }}>+91</span>
              <input className="form-input" style={{ border: 'none', borderRadius: 0, flex: 1 }} type="tel" placeholder="Enter mobile number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            {error && <div className="form-error" style={{ textAlign: 'center' }}>{error}</div>}
            <button className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} onClick={sendOtp} style={{ marginTop: 8 }}>
              {loading ? <Spinner size={20} /> : 'Send OTP'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>Demo OTP works too: <strong>1234</strong></div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="otp-inputs">
              {otp.map((v, i) => (
                <input key={i} id={`otp-${i}`} className="otp-input" type="number" value={v}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => e.key === 'Backspace' && !otp[i] && i > 0 && document.getElementById(`otp-${i-1}`)?.focus()} />
              ))}
            </div>
            {devOtp && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--teal-dark)', background: 'var(--teal-xlight)', padding: '6px 12px', borderRadius: 8 }}>Dev OTP: <strong>{devOtp}</strong></div>}
            {error && <div className="form-error" style={{ textAlign: 'center' }}>{error}</div>}
            <button className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} onClick={verifyOtp}>
              {loading ? <Spinner size={20} /> : 'Confirm'}
            </button>
            <button className="btn btn-outline btn-full" onClick={() => { setOtp(['1','2','3','4']); setTimeout(() => verifyOtp(), 0); }}>
              Use demo OTP
            </button>
            <button className="btn btn-ghost btn-full" style={{ color: 'var(--muted)', fontSize: 13 }} onClick={() => setStep('phone')}>
              Change number
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px 32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--teal-dark)', fontWeight: 600 }}>Log In</Link>
      </div>
    </div>
  );
}
