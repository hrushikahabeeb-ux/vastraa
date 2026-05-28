import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useWishlistStore, useCartStore, useUIStore } from '../store';
import { Icon, BackNav, EmptyState } from '../components/shared';

export default function Wishlist() {
  const nav = useNavigate();
  const { ids, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    productsAPI.getAll()
      .then(res => setProducts(res.products.filter(p => ids.includes(p.id))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids.length]);

  return (
    <div className="screen">
      <BackNav title={`Wishlist${products.length > 0 ? ` (${products.length})` : ''}`} />
      <div className="screen-scroll" style={{ padding:'12px 16px' }}>
        {loading ? (
          <div className="flex-center" style={{ paddingTop:60 }}>
            <div style={{ width:32,height:32,border:'3px solid var(--border)',borderTop:'3px solid var(--teal-dark)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="♡" title="Your wishlist is empty"
            subtitle="Tap the heart on any product to save it here"
            action={<button className="btn btn-primary" onClick={() => nav('/')}>Browse Products</button>} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {products.map(p => (
              <div key={p.id} style={{ display:'flex', gap:12, padding:14, border:'1px solid var(--border2)', borderRadius:'var(--r)', background:'var(--surface)', alignItems:'flex-start' }}>
                <div style={{ width:84, height:106, borderRadius:'var(--r-sm)', overflow:'hidden', flexShrink:0, background:'var(--teal-xxlight)', cursor:'pointer' }}
                  onClick={() => nav(`/product/${p.id}`)}>
                  <img src={p.images[0]} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}
                    onError={e => { e.target.style.display='none'; }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10,fontWeight:700,color:'var(--muted2)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:2 }}>{p.brand}</div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:6, lineHeight:1.3, cursor:'pointer' }}
                    onClick={() => nav(`/product/${p.id}`)}>{p.name}</div>
                  <div style={{ display:'flex', gap:6, alignItems:'baseline', marginBottom:10 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>₹{p.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize:12,color:'var(--muted2)',textDecoration:'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize:11,color:'var(--success)',fontWeight:700 }}>{p.discount}% off</span>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex:1 }}
                      onClick={() => {
                        addItem({ productId:p.id, name:p.name, brand:p.brand, price:p.price,
                          image:p.images[0], size:p.sizes[1]||p.sizes[0], color:p.colorNames[0], qty:1 });
                        showToast('Added to cart 🛍️');
                      }}>
                      Add to Cart
                    </button>
                    <button
                      onClick={() => { toggle(p.id); showToast('Removed from wishlist'); }}
                      style={{ width:36, height:36, borderRadius:'var(--r-sm)', border:'1.5px solid var(--border)',
                        background:'none', display:'flex', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', color:'var(--danger)', flexShrink:0 }}>
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height:20 }} />
      </div>
    </div>
  );
}
