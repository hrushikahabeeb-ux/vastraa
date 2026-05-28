import { useNavigate } from 'react-router-dom';
import { useCartStore, useUIStore } from '../store';
import { Icon, EmptyState, PriceRow } from '../components/shared';

export default function Cart() {
  const nav = useNavigate();
  const { items, removeItem, updateQty, clearCart } = useCartStore();
  const { showToast } = useUIStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal + deliveryFee;

  if (items.length === 0) return (
    <div className="screen">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)}><Icon.Back /></button>
        <span style={{ fontWeight: 600, fontSize: 17 }}>My Cart</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState icon="🛍️" title="Your cart is empty" subtitle="Add items to get started"
          action={<button className="btn btn-primary" onClick={() => nav('/')}>Browse Products</button>} />
      </div>
    </div>
  );

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)}><Icon.Back /></button>
          <span style={{ fontWeight: 600, fontSize: 17 }}>My Cart ({items.length})</span>
        </div>
        <button onClick={() => { clearCart(); showToast('Cart cleared'); }} style={{ fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear All</button>
      </div>

      <div className="screen-scroll">
        {/* Delivery promise */}
        {subtotal < 999 && (
          <div style={{ margin: '12px 16px', background: 'var(--teal-xlight)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13 }}>
            Add <strong>₹{(999 - subtotal).toLocaleString('en-IN')}</strong> more for <strong style={{ color: 'var(--teal-dark)' }}>FREE delivery</strong>
          </div>
        )}

        {/* Cart Items */}
        <div style={{ padding: '0 16px' }}>
          {items.map((item, idx) => (
            <div key={`${item.productId}_${item.size}_${item.color}`} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <img src={item.image} alt={item.name} style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 'var(--r-sm)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  Size: {item.size} · {item.color}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)}>
                      {item.qty === 1 ? <Icon.Trash /> : <Icon.Minus />}
                    </button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)}><Icon.Plus /></button>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button onClick={() => { removeItem(item.productId, item.size, item.color); showToast('Removed from cart'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', alignSelf: 'flex-start', padding: 4 }}>
                <Icon.Trash />
              </button>
            </div>
          ))}
        </div>

        {/* Coupon teaser */}
        <div style={{ margin: '8px 16px', padding: '12px 14px', border: '1.5px dashed var(--teal)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => nav('/checkout')}>
          <Icon.Tag />
          <span style={{ fontSize: 14, color: 'var(--teal-dark)', fontWeight: 500 }}>Apply coupon or gift card</span>
          <Icon.ChevronRight />
        </div>

        {/* Order Summary */}
        <div style={{ margin: '8px 16px 16px', background: 'var(--bg)', borderRadius: 'var(--r)', padding: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Order Summary</div>
          <PriceRow label={`Subtotal (${items.length} items)`} value={subtotal} />
          <PriceRow label="Delivery" value={deliveryFee === 0 ? 'FREE' : deliveryFee} success={deliveryFee === 0} />
          <div className="divider" />
          <PriceRow label="Total" value={total} bold large />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>GST & taxes calculated at checkout</div>
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* Checkout CTA */}
      <div className="sticky-bottom">
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total payable</span>
          <span style={{ fontWeight: 700, fontSize: 20 }}>₹{total.toLocaleString('en-IN')}</span>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={() => nav('/checkout')}>
          Proceed to Checkout ({items.length} {items.length === 1 ? 'item' : 'items'})
        </button>
      </div>
    </div>
  );
}
