import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, useUIStore, useWishlistStore } from '../store';

// ─── ICONS ────────────────────────────────────────────────────────────────────
export const Icon = {
  Home:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  HomeFill:  () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L3 9v13a1 1 0 0 0 1 1h6v-7h4v7h6a1 1 0 0 0 1-1V9z"/></svg>,
  Search:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cart:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  CartFill:  () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 6H3L6 2h12l3 4zM3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6H3zm9 9a4 4 0 0 1-4-4h2a2 2 0 0 0 4 0h2a4 4 0 0 1-4 4z"/></svg>,
  User:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  UserFill:  () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>,
  Package:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  PackFill:  () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Heart:     ({ filled }) => <svg viewBox="0 0 24 24" fill={filled?'var(--danger)':'none'} stroke={filled?'var(--danger)':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Back:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Check:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Tag:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  ChevRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Star:      ({ filled }) => <svg viewBox="0 0 24 24" fill={filled?'#C9A84C':'none'} stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Bike:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M15 6h-1l-3.5 7-1.5-3H6"/><path d="M15 6l3.5 5.5"/></svg>,
  Logout:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Edit:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Phone:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.62 2 2 0 0 1 3.62 1.44h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>,
  Map:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Filter:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  Share:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
export function Logo({ size = 'md' }) {
  const sz = { sm:20, md:26, lg:36, xl:48 }[size];
  return (
    <span className="navbar-logo" style={{ fontSize: sz }}>
      <em>V</em>astra
    </span>
  );
}

// ─── BACK NAV ─────────────────────────────────────────────────────────────────
export function BackNav({ title, right }) {
  const nav = useNavigate();
  return (
    <div className="navbar">
      <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} style={{ marginLeft:-6 }}>
        <Icon.Back />
      </button>
      <span style={{ fontWeight:600, fontSize:16 }}>{title}</span>
      <div style={{ minWidth:40 }}>{right}</div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
export function BottomNav() {
  const { pathname } = useLocation();
  const count = useCartStore(s => s.items.reduce((a,i)=>a+i.qty,0));

  const tabs = [
    { to:'/',        label:'Home',   icon:<Icon.Home />,    iconActive:<Icon.HomeFill /> },
    { to:'/search',  label:'Search', icon:<Icon.Search /> },
    { to:'/cart',    label:'Cart',   icon:<Icon.Cart />,    iconActive:<Icon.CartFill />, badge:count },
    { to:'/orders',  label:'Orders', icon:<Icon.Package />, iconActive:<Icon.PackFill /> },
    { to:'/account', label:'Account',icon:<Icon.User />,    iconActive:<Icon.UserFill /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(t => {
        const active = pathname === t.to;
        return (
          <Link key={t.to} to={t.to} className={`bottom-nav-item${active?' active':''}`}>
            {t.badge > 0 && <span className="cart-badge">{t.badge > 9 ? '9+' : t.badge}</span>}
            {active && t.iconActive ? t.iconActive : t.icon}
            <span>{t.label}</span>
            {active && <span className="bottom-nav-indicator" />}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function Toast() {
  const { toast } = useUIStore();
  if (!toast) return null;
  return <div key={toast.id} className={`toast ${toast.type || ''}`}>{toast.message}</div>;
}

// ─── STARS ────────────────────────────────────────────────────────────────────
export function Stars({ rating, reviews }) {
  return (
    <div className="flex gap-8" style={{ alignItems:'center' }}>
      <div className="stars-row">
        {[1,2,3,4,5].map(i => <Icon.Star key={i} filled={i <= Math.round(rating)} />)}
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{rating}</span>
      {reviews && <span style={{ fontSize:12, color:'var(--muted)' }}>({reviews >= 1000 ? (reviews/1000).toFixed(1)+'k' : reviews})</span>}
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = 'var(--teal-dark)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation:'spin 0.75s linear infinite', flexShrink:0 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--teal-light)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex-col flex-center" style={{ padding:'64px 24px', gap:12 }}>
      <div style={{ fontSize:52, marginBottom:4 }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:20, textAlign:'center' }}>{title}</div>
      {subtitle && <div style={{ color:'var(--muted)', fontSize:14, textAlign:'center', lineHeight:1.6 }}>{subtitle}</div>}
      {action}
    </div>
  );
}

// ─── PRICE ROW ────────────────────────────────────────────────────────────────
export function PriceRow({ label, value, bold, success, danger, large }) {
  return (
    <div className="price-row" style={{ marginBottom:10 }}>
      <span className={`price-row-label${bold?' font-600':''}`} style={{ fontSize: bold ? (large?16:15) : 14, color: bold ? 'var(--text)' : 'var(--muted)' }}>
        {label}
      </span>
      <span className={`price-row-value${bold?' font-700':''}`} style={{
        fontSize: bold ? (large?18:16) : 14,
        color: success ? 'var(--success)' : danger ? 'var(--danger)' : 'var(--text)'
      }}>
        {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
      </span>
    </div>
  );
}
