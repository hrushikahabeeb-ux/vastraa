import { useNavigate } from 'react-router-dom';
import { Logo, Icon } from '../components/shared';

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--teal-xlight)' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
      </div>
      <div style={{ padding: '28px 32px 0', textAlign: 'center' }}>
        <Logo size="xl" />
        <div style={{ width: 60, height: 2, background: 'var(--teal-dark)', margin: '12px auto 0' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, marginBottom: 10 }}>
            Discover &<br />Find Your Own <em>Fashion</em>
          </div>
          <div style={{ color: 'var(--muted)', textAlign: 'center', fontSize: 14 }}>
            Curated collections for every style, delivered blazing fast.
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary btn-full btn-lg" style={{ borderRadius: 'var(--r-xl)' }} onClick={() => nav('/login')}>
          Log In
        </button>
        <button className="btn btn-outline btn-full btn-lg" style={{ borderRadius: 'var(--r-xl)' }} onClick={() => nav('/signup')}>
          Create Account
        </button>
        <button className="btn btn-ghost btn-full" style={{ color: 'var(--muted)', fontSize: 13 }} onClick={() => nav('/')}>
          Continue as Guest
        </button>

        {/* Social login hints */}
        <div className="divider-text" style={{ marginTop: 8 }}>or sign in with</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {['G', 'f', 'in'].map((s, i) => (
            <button key={i} style={{
              width: 48, height: 48, borderRadius: '50%', border: '1.5px solid var(--border)',
              background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 16, color: ['#EA4335', '#1877F2', '#0077B5'][i], cursor: 'pointer',
            }} onClick={() => nav('/login')}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
