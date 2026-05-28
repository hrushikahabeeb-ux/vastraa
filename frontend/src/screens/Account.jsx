import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';
import { authAPI } from '../utils/api';
import { Icon, Spinner } from '../components/shared';

export default function Account() {
  const nav = useNavigate();
  const { user, isLoggedIn, logout, updateUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.user);
      setEditing(false);
      showToast('Profile updated!');
    } catch { showToast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    nav('/welcome');
    showToast('Logged out successfully');
  };

  const menuSections = [
    {
      title: 'My Activity',
      items: [
        { icon: '📦', label: 'My Orders', action: () => nav('/orders') },
        { icon: '❤️', label: 'Wishlist', action: () => nav('/wishlist') },
        { icon: '🏷️', label: 'Coupons', badge: user?.coupons?.length || 0, action: () => showToast(`You have ${user?.coupons?.length || 0} coupons`) },
        { icon: '📍', label: 'Saved Addresses', action: () => nav('/checkout') },
      ],
    },
    {
      title: 'Earn with Vastra',
      items: [
        { icon: '🎁', label: 'Refer & Earn', action: () => showToast('Share your referral code: VASTRA' + (user?.id?.slice(-4).toUpperCase() || '1234')) },
        { icon: '⭐', label: 'Rate the App', action: () => showToast('Thanks for your feedback! ⭐') },
        { icon: '🤝', label: 'Partner with Us', action: () => showToast('Coming soon!') },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: '🔔', label: 'Notifications', action: () => showToast('Notifications: Enabled') },
        { icon: '🌐', label: 'Language', sub: 'English', action: () => {} },
        { icon: '🔒', label: 'Privacy Policy', action: () => {} },
        { icon: '📄', label: 'Terms, Policies and Licences', action: () => {} },
        { icon: '❓', label: 'Help Centre', action: () => showToast('Help: support@vastra.in') },
      ],
    },
  ];

  return (
    <div className="screen">
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 17, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
        <span>Account</span>
        {isLoggedIn && !editing ? (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-dark)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500 }}>
            <Icon.Edit /> Edit
          </button>
        ) : (
          <div style={{ width: 40 }} />
        )}
      </div>

      <div className="screen-scroll">
        {/* Profile card */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal-darker))', padding: '24px 20px', color: 'white' }}>
          {isLoggedIn ? (
            <div>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="First name" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="Last name" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email" style={{ padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone" style={{ padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    <button onClick={handleSave} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'white', color: 'var(--teal-darker)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 }}>
                    {user.firstName[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                    {user.phone && <div style={{ opacity: 0.85, fontSize: 14, marginTop: 2 }}>{user.phone}</div>}
                    {user.email && <div style={{ opacity: 0.75, fontSize: 13 }}>{user.email}</div>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>👤</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Hello, Guest</div>
              <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 16 }}>Log in to access your orders and wishlist</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => nav('/login')} style={{ padding: '10px 24px', borderRadius: 20, background: 'white', color: 'var(--teal-darker)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Log In</button>
                <button onClick={() => nav('/signup')} style={{ padding: '10px 24px', borderRadius: 20, background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.6)', fontWeight: 500, cursor: 'pointer' }}>Sign Up</button>
              </div>
            </div>
          )}
        </div>

        {/* Menu sections */}
        <div style={{ padding: '8px 0' }}>
          {menuSections.map(section => (
            <div key={section.title} style={{ marginBottom: 8 }}>
              <div style={{ padding: '12px 16px 6px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {section.title}
              </div>
              {section.items.map(item => (
                <button key={item.label} onClick={item.action} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 15 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background: 'var(--teal-dark)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{item.badge}</span>
                  )}
                  {item.sub && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item.sub}</span>}
                  <Icon.ChevronRight />
                </button>
              ))}
            </div>
          ))}

          {/* Logout */}
          {isLoggedIn && (
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--danger)', fontSize: 15, fontWeight: 500, marginTop: 8,
            }}>
              <Icon.Logout />
              Log Out
            </button>
          )}
        </div>

        {/* App version */}
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)', fontSize: 12 }}>
          Vastra v1.0.0 · Fashion in 15 Minutes
        </div>
      </div>
    </div>
  );
}
