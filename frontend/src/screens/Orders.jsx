import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../utils/api';
import { Icon, Spinner } from '../components/shared';

// ─── ORDER SUCCESS ────────────────────────────────────────────────────────────
export function OrderSuccess() {
  const nav = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  useEffect(() => {
    if (!order) nav('/');
  }, []);

  if (!order) return null;

  return (
    <div className="screen" style={{ background: 'linear-gradient(160deg, var(--teal-xlight) 0%, white 60%)' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back">
          <Icon.Back />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px 32px', textAlign: 'center' }}>
        {/* Animated checkmark */}
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order Placed!</div>
        <div style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 6 }}>You have successfully placed your order</div>
        <div style={{ fontWeight: 600, color: 'var(--teal-dark)', fontSize: 14, marginBottom: 28 }}>Order ID: {order.id}</div>

        {/* Rider info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 24, width: '100%', maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Your delivery partner</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
              {order.rider.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{order.rider.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>⭐ {order.rider.rating} · {order.rider.phone}</div>
            </div>
            <a href={`tel:${order.rider.phone}`} style={{ marginLeft: 'auto' }}>
              <button style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--teal-xlight)', border: 'none', cursor: 'pointer', color: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.62 2 2 0 0 1 3.62 1.44h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
              </button>
            </a>
          </div>
        </div>

        {/* ETA */}
        <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 32 }}>
          Estimated delivery: <strong style={{ color: 'var(--teal-dark)' }}>15 minutes</strong> ⚡
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => nav(`/track/${order.id}`)}>
            Track Order →
          </button>
          <button className="btn btn-outline btn-full" onClick={() => nav('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS LIST ──────────────────────────────────────────────────────────────
export function Orders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll()
      .then(res => setOrders(res.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { placed: 'var(--gold)', confirmed: 'var(--teal-dark)', packed: 'var(--teal-dark)', picked: '#6366f1', nearby: '#8b5cf6', delivered: 'var(--success)' };

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)} aria-label="Go back"><Icon.Back /></button>
        <span>My Orders</span>
      </div>
      <div className="screen-scroll" style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={36} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>No orders yet</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6, marginBottom: 24 }}>Your orders will appear here</div>
            <button className="btn btn-primary" onClick={() => nav('/')}>Start Shopping</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', marginTop: 16, overflow: 'hidden' }}>
              {/* Order header */}
              <div style={{ padding: '12px 14px', background: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{order.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: statusColors[order.tracking?.currentStage] || 'var(--teal-dark)', background: 'rgba(143,179,176,0.12)', padding: '4px 12px', borderRadius: 12, textTransform: 'capitalize' }}>
                  {order.tracking?.currentStage?.replace(/_/g, ' ') || order.status}
                </span>
              </div>

              {/* Items preview */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} style={{ width: 52, height: 64, objectFit: 'cover', borderRadius: 'var(--r-sm)' }} />
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ width: 52, height: 64, borderRadius: 'var(--r-sm)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-between">
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.breakdown.total.toLocaleString('en-IN')}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {!order.tracking?.delivered && (
                      <button className="btn btn-sm btn-outline" onClick={() => nav(`/track/${order.id}`)}>Track</button>
                    )}
                    <button className="btn btn-sm btn-primary" onClick={() => nav(`/order/${order.id}`)}>Details</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─── ORDER TRACKING ───────────────────────────────────────────────────────────
export function Tracking() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [rider, setRider] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef();

  const fetchTracking = async () => {
    try {
      const res = await ordersAPI.track(id);
      setTracking(res.tracking);
      setRider(res.rider);
      if (!order) {
        const ores = await ordersAPI.getById(id);
        setOrder(ores.order);
      }
    } catch { nav(-1); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, 15000);
    return () => clearInterval(intervalRef.current);
  }, [id]);

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={36} /></div>;

  return (
    <div className="screen">
      <div className="navbar" style={{ position: 'sticky', top: 0, zIndex: 60 }}>
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => nav(-1)}
          aria-label="Go back"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ display: 'inline-flex', width: 20, height: 20 }}>
            <Icon.Back />
          </span>
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Track Order · {id}</span>
        <div style={{ width: 40 }} />
      </div>
      <div className="screen-scroll" style={{ padding: '16px' }}>
        {/* ETA card */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal-darker))', borderRadius: 'var(--r-lg)', padding: '20px', color: 'white', marginBottom: 20, textAlign: 'center', boxShadow: '0 14px 30px rgba(42, 90, 86, 0.18)' }}>
          {tracking?.delivered ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700 }}>Delivered!</div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>Your order has been delivered</div>
            </>
          ) : (
            <>
              <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 4 }}>Estimated Arrival</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 48, fontWeight: 700, lineHeight: 1 }}>{tracking?.eta || 0}</div>
              <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>minutes away ⚡</div>
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.18)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${tracking?.progress || 0}%`, height: '100%', background: 'white', borderRadius: 999, transition: 'width 0.35s ease' }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Live progress: {tracking?.progress || 0}%</div>
            </>
          )}
        </div>

        <div style={{ background: 'linear-gradient(180deg, rgba(143,179,176,0.12), rgba(255,255,255,0.95))', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Live delivery updates</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Auto-refreshes every 15 seconds</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchTracking}>Refresh</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '12px' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Current stage</div>
              <div style={{ fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{tracking?.currentStage?.replace(/_/g, ' ')}</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '12px' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order ID</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{id}</div>
            </div>
          </div>
        </div>

        {/* Rider card */}
        {rider && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Your Delivery Partner</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>{rider.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{rider.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>⭐ {rider.rating} · Delivery Partner</div>
              </div>
              <a href={`tel:${rider.phone}`}>
                <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--teal-xlight)', border: 'none', cursor: 'pointer', color: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.62 2 2 0 0 1 3.62 1.44h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
                </button>
              </a>
            </div>
          </div>
        )}

        {/* Tracking steps */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Order Status</div>
          {tracking?.stages?.map((stage, i) => (
            <div key={stage.id} className={`tracking-step ${stage.completed ? 'done' : ''}`}>
              <div className={`step-dot ${stage.completed ? 'done' : ''} ${stage.active ? 'active' : ''}`}>
                {stage.completed ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontWeight: stage.active ? 600 : 400, fontSize: 14, color: stage.completed ? 'var(--text)' : 'var(--muted)' }}>
                  {stage.label}
                </div>
                {stage.time && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{stage.time}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        {order && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Order Summary</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <img src={item.image} alt={item.name} style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 'var(--r-sm)' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {item.qty} · Size: {item.size}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
            <div className="divider" />
            <div className="flex-between">
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Total Paid</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>₹{order.breakdown.total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>via {order.paymentMethod}</div>
          </div>
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
