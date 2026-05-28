import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressesAPI, ordersAPI } from '../utils/api';
import { useCartStore, useAuthStore, useUIStore } from '../store';
import { Icon, Spinner, PriceRow } from '../components/shared';

export default function Checkout() {
  const nav = useNavigate();
  const { items, clearCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUIStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [breakdown, setBreakdown] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (!isLoggedIn) { nav('/login'); return; }
    loadAddresses();
    recalculate();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressesAPI.getAll();
      setAddresses(res.addresses);
      const def = res.addresses.find(a => a.isDefault) || res.addresses[0];
      if (def) setSelectedAddr(def.id);
    } catch {}
  };

  const recalculate = async (code) => {
    try {
      const res = await ordersAPI.calculate({ items: items.map(i => ({ price: i.price, qty: i.qty })), couponCode: code });
      setBreakdown(res.breakdown);
    } catch {}
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await ordersAPI.validateCoupon(coupon, subtotal);
      setCouponResult(res);
      if (res.valid) { await recalculate(coupon); showToast(res.message); }
      else showToast(res.message, 'error');
    } catch {
      showToast('Could not apply coupon', 'error');
    } finally { setCouponLoading(false); }
  };

  const saveAddress = async () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      showToast('Fill all required fields', 'error'); return;
    }
    try {
      const res = await addressesAPI.add({ ...newAddr, isDefault: addresses.length === 0 });
      setAddresses(a => [...a, res.address]);
      setSelectedAddr(res.address.id);
      setShowAddrForm(false);
      showToast('Address saved');
    } catch { showToast('Failed to save address', 'error'); }
  };

  const placeOrder = async () => {
    if (!selectedAddr) { showToast('Select a delivery address', 'error'); return; }
    setPlacing(true);
    try {
      const res = await ordersAPI.place({
        items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, image: i.image, size: i.size, color: i.color })),
        addressId: selectedAddr,
        paymentMethod,
        couponCode: couponResult?.valid ? coupon : null,
      });
      clearCart();
      nav('/order-success', { state: { order: res.order } });
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally { setPlacing(false); }
  };

  const b = breakdown || { subtotal, deliveryFee: subtotal >= 999 ? 0 : 49, discount: 0, gst: Math.round(subtotal * 0.05), total: subtotal + (subtotal >= 999 ? 0 : 49) + Math.round(subtotal * 0.05) };

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)}><Icon.Back /></button>
        <span style={{ fontWeight: 600, fontSize: 17 }}>Checkout</span>
      </div>

      <div className="screen-scroll" style={{ padding: '0 16px' }}>
        {/* Delivery Address */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>📍 Delivery Address</span>
            <button onClick={() => setShowAddrForm(v => !v)} style={{ fontSize: 13, color: 'var(--teal-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>
              + Add New
            </button>
          </div>

          {showAddrForm && (
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--r)', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {['Home', 'Work', 'Other'].map(l => (
                  <button key={l} className={`chip${newAddr.label === l ? ' active' : ''}`} style={{ padding: '5px 14px', fontSize: 13 }} onClick={() => setNewAddr(p => ({ ...p, label: l }))}>{l}</button>
                ))}
              </div>
              {[['name', 'Full Name *'], ['phone', 'Phone *'], ['line1', 'Address Line 1 *'], ['line2', 'Landmark / Area'], ['city', 'City *'], ['state', 'State'], ['pincode', 'Pincode *']].map(([k, pl]) => (
                <input key={k} className="form-input" style={{ marginBottom: 10 }} placeholder={pl} value={newAddr[k]} onChange={e => setNewAddr(p => ({ ...p, [k]: e.target.value }))} />
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowAddrForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={saveAddress}>Save Address</button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !showAddrForm && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: 14, background: 'var(--bg)', borderRadius: 'var(--r)' }}>
              No saved addresses. Add one above.
            </div>
          )}

          {addresses.map(a => (
            <div key={a.id} onClick={() => setSelectedAddr(a.id)}
              style={{ padding: '12px 14px', border: `1.5px solid ${selectedAddr === a.id ? 'var(--teal-dark)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', marginBottom: 10, cursor: 'pointer', background: selectedAddr === a.id ? 'var(--teal-xlight)' : 'var(--surface)', display: 'flex', gap: 12 }}>
              <div style={{ marginTop: 2 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedAddr === a.id ? 'var(--teal-dark)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedAddr === a.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--teal-dark)' }} />}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                  <span style={{ fontSize: 11, background: 'var(--teal-xlight)', color: 'var(--teal-darker)', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>{a.label}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}{a.state ? `, ${a.state}` : ''} — {a.pincode}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>📞 {a.phone}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>🛍️ Items ({items.length})</div>
          {items.map(item => (
            <div key={`${item.productId}_${item.size}_${item.color}`} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <img src={item.image} alt={item.name} style={{ width: 54, height: 68, objectFit: 'cover', borderRadius: 'var(--r-sm)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Size: {item.size} · {item.color} · Qty: {item.qty}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Coupon */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>🏷️ Coupon Code</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Enter coupon code" value={coupon}
              onChange={e => setCoupon(e.target.value.toUpperCase())} />
            <button className={`btn btn-outline btn-sm ${couponLoading ? 'btn-loading' : ''}`} onClick={applyCoupon} style={{ whiteSpace: 'nowrap' }}>
              {couponLoading ? <Spinner size={16} /> : 'Apply'}
            </button>
          </div>
          {couponResult && (
            <div style={{ marginTop: 8, fontSize: 13, color: couponResult.valid ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
              {couponResult.valid ? '✅' : '❌'} {couponResult.message}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['WELCOME10', 'VASTRA20', 'SAVE100'].map(c => (
              <button key={c} onClick={() => { setCoupon(c); }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '1px dashed var(--teal)', color: 'var(--teal-dark)', background: 'var(--teal-xlight)', cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Payment */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💳 Payment Method</div>
          {[
            { id: 'UPI', label: 'Pay by any UPI app', icon: '📱', sub: 'PhonePe, GPay, Paytm & more' },
            { id: 'CARD', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
            { id: 'COD', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when order arrives' },
          ].map(p => (
            <div key={p.id} className={`payment-option${paymentMethod === p.id ? ' selected' : ''}`} onClick={() => setPaymentMethod(p.id)}>
              <span style={{ fontSize: 22 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.sub}</div>
              </div>
              <div className="radio-dot" style={{ borderColor: paymentMethod === p.id ? 'var(--teal-dark)' : 'var(--border)' }}>
                {paymentMethod === p.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal-dark)' }} />}
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Bill */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>🧾 Bill Details</div>
          <PriceRow label="Items total" value={b.subtotal} />
          <PriceRow label="Delivery charges" value={b.deliveryFee === 0 ? 'FREE' : b.deliveryFee} success={b.deliveryFee === 0} />
          {b.discount > 0 && <PriceRow label="Coupon discount" value={`-₹${b.discount.toLocaleString('en-IN')}`} success />}
          <PriceRow label="GST (5%)" value={b.gst} />
          <div className="divider" style={{ margin: '10px 0' }} />
          <PriceRow label="Total Amount" value={b.total} bold large />
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Place Order */}
      <div className="sticky-bottom">
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total Payable</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>₹{b.total.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--teal-dark)', fontWeight: 500 }}>⚡ 15-min delivery</div>
        </div>
        <button className={`btn btn-primary btn-full btn-lg ${placing ? 'btn-loading' : ''}`} onClick={placeOrder}>
          {placing ? <><Spinner size={20} /> Placing Order…</> : `Place Order · ₹${b.total.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}
