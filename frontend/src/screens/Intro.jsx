import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Icon } from '../components/shared';

export default function Intro() {
  const nav = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      flex:1, position:'relative', overflow:'hidden',
      background: 'linear-gradient(160deg, #4a7a76 0%, #2a5a56 55%, #1a3a36 100%)',
      display:'flex', flexDirection:'column',
    }}>
      <div style={{ padding: '16px 16px 0', position: 'relative', zIndex: 2 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
          <Icon.Back />
        </button>
      </div>

      {/* Decorative circles */}
      <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
      <div style={{ position:'absolute', bottom:160, left:-100, width:360, height:360, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
      <div style={{ position:'absolute', top:'35%', right:'-5%', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)' }} />

      {/* Logo area */}
      <div style={{
        padding:'80px 36px 0',
        opacity: phase>=1 ? 1 : 0,
        transform: phase>=1 ? 'translateY(0)' : 'translateY(24px)',
        transition:'all 0.7s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:62, fontWeight:300, color:'white', letterSpacing:5, lineHeight:1, fontStyle:'italic' }}>
          Vastra
        </div>
        <div style={{ width:48, height:2, background:'rgba(255,255,255,0.5)', marginTop:10, marginBottom:8 }} />
        <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12, letterSpacing:3, textTransform:'uppercase', fontWeight:500 }}>
          Fashion · Delivered
        </div>
      </div>

      {/* Hero image */}
      <div style={{
        flex:1, display:'flex', alignItems:'flex-end',
        opacity: phase>=1 ? 1 : 0,
        transition:'opacity 1s ease 0.4s',
      }}>
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&crop=top"
          alt="Fashion"
          style={{ width:'100%', height:320, objectFit:'cover', objectPosition:'top' }}
          onError={e => e.target.style.display='none'}
        />
      </div>

      {/* CTA card */}
      <div style={{
        background:'var(--surface)',
        padding:'28px 24px calc(36px + var(--sab))',
        borderRadius:'32px 32px 0 0',
        opacity: phase>=2 ? 1 : 0,
        transform: phase>=2 ? 'translateY(0)' : 'translateY(48px)',
        transition:'all 0.65s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700, lineHeight:1.25, marginBottom:6 }}>
          If you can't stop<br />
          <span style={{ fontStyle:'italic', color:'var(--teal-dark)' }}>thinking about it,</span>
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:400, color:'var(--teal-darker)', marginBottom:4, fontStyle:'italic' }}>
          Buy It.
        </div>
        <div style={{ color:'var(--muted)', fontSize:13, marginBottom:28 }}>
          30+ curated styles. Delivered in 15 minutes.
        </div>
        <button
          className="btn btn-primary btn-full btn-lg btn-pill"
          onClick={() => nav('/welcome')}
          style={{ fontSize:16, letterSpacing:0.3 }}
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}
