import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useAuthStore, useCartStore, useWishlistStore, useUIStore } from '../store';
import { Icon, Spinner } from '../components/shared';

// ─── BADGE CLASS MAP ──────────────────────────────────────────────────────────
const badgeClass = (b) => {
  if (!b) return '';
  const m = { 'On Sale':'sale','New':'new','Trending':'trend','Premium':'premium',
               'Kids Fav':'kids','Bestseller':'','Top Rated':'','Kids Fav':'kids' };
  return m[b] || '';
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, delay = 0 }) {
  const nav = useNavigate();
  const { has, toggle } = useWishlistStore();
  const { showToast } = useUIStore();
  const [imgErr, setImgErr] = useState(false);
  const wished = has(product.id);

  const handleWish = (e) => {
    e.stopPropagation();
    toggle(product.id);
    try { productsAPI.toggleWishlist(product.id); } catch {}
    showToast(wished ? 'Removed from wishlist' : 'Saved to wishlist ♡');
  };

  return (
    <div
      className="product-card anim-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => nav(`/product/${product.id}`)}
    >
      {product.badge && (
        <span className={`product-card-badge ${badgeClass(product.badge)}`}>
          {product.badge}
        </span>
      )}
      <button className="product-card-wishlist" onClick={handleWish}
        style={{ color: wished ? 'var(--danger)' : 'var(--muted)' }}>
        <Icon.Heart filled={wished} />
      </button>
      {imgErr ? (
        <div style={{ width:'100%', aspectRatio:'3/4', background:'var(--teal-xxlight)',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
          <span style={{ fontSize:32 }}>👗</span>
          <span style={{ fontSize:10, color:'var(--muted)', textAlign:'center', padding:'0 8px' }}>{product.name}</span>
        </div>
      ) : (
        <img className="product-card-img" src={product.images[0]} alt={product.name}
          loading="lazy" onError={() => setImgErr(true)} />
      )}
      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-rating">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>{product.rating}</span>
          <span style={{ color:'var(--muted2)' }}>({product.reviewCount >= 1000 ? (product.reviewCount/1000).toFixed(1)+'k' : product.reviewCount})</span>
        </div>
        <div className="product-card-price">
          <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          <span className="price-discount">{product.discount}% off</span>
        </div>
        <div className="product-card-delivery">⚡ {product.deliveryTime}</div>
      </div>
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius:'var(--r)', overflow:'hidden', border:'1px solid var(--border2)' }}>
      <div className="skeleton" style={{ aspectRatio:'3/4' }} />
      <div style={{ padding:'10px 12px 13px' }}>
        <div className="skeleton" style={{ height:10, width:'60%', marginBottom:8 }} />
        <div className="skeleton" style={{ height:13, marginBottom:8 }} />
        <div className="skeleton" style={{ height:12, width:'75%' }} />
      </div>
    </div>
  );
}

const CATS = [
  { id:'all',     label:'All' },
  { id:'Women',   label:'Women' },
  { id:'Men',     label:'Men' },
  { id:'Kids',    label:'Kids' },
  { id:'ethnic',  label:'Ethnic' },
  { id:'western', label:'Western' },
  { id:'festive', label:'Festive' },
  { id:'active',  label:'Active' },
];
const SORTS = [
  { val:'',           label:'Recommended' },
  { val:'discount',   label:'Best Deals' },
  { val:'rating',     label:'Top Rated' },
  { val:'price_asc',  label:'Price ↑' },
  { val:'price_desc', label:'Price ↓' },
];

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const cartCount = useCartStore(s => s.items.reduce((a,i)=>a+i.qty,0));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('');
  const catRef = useRef(null);

  const load = async (c, s) => {
    setLoading(true);
    try {
      const p = {};
      if (c !== 'all') p.category = c;
      if (s) p.sort = s;
      const res = await productsAPI.getAll(p);
      setProducts(res.products);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(cat, sort); }, [cat, sort]);

  const handleCat = (id) => {
    setCat(id);
    // Scroll cat chip into view
    setTimeout(() => {
      const el = catRef.current?.querySelector(`[data-cat="${id}"]`);
      el?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
    }, 50);
  };

  return (
    <div className="screen">
      {/* ── TOP BAR ── */}
      <div style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        padding: 'calc(12px + var(--sat)) 16px 10px',
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border2)',
      }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <button className="btn btn-icon btn-ghost" onClick={() => nav('/welcome')} aria-label="Go back">
            <Icon.Back />
          </button>
          <div className="navbar-logo"><em>V</em>astra</div>
          <div className="flex gap-8">
            <button className="btn btn-icon btn-ghost" onClick={() => nav('/wishlist')} style={{ position:'relative' }}>
              <Icon.Heart />
            </button>
            <button className="btn btn-icon btn-ghost" onClick={() => nav('/cart')} style={{ position:'relative' }}>
              <Icon.Cart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="btn btn-icon btn-ghost" onClick={() => nav('/account')}>
              {user
                ? <div style={{ width:30,height:30,borderRadius:'50%',background:'var(--teal-dark)',
                    color:'white',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:13,fontWeight:700 }}>
                    {user.firstName[0].toUpperCase()}
                  </div>
                : <Icon.User />
              }
            </button>
          </div>
        </div>
        {/* Search tap target */}
        <div className="search-bar" onClick={() => nav('/search')} style={{ cursor:'pointer' }}>
          <Icon.Search />
          <span style={{ color:'#C0C0C0', fontSize:14 }}>Search clothes, brands…</span>
        </div>
      </div>

      <div className="screen-scroll">
        {/* ── HERO BANNER ── */}
        <div style={{ padding:'14px 16px 0' }}>
          <div className="hero-banner">
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:'uppercase',opacity:0.75,marginBottom:8 }}>
              ⚡ Limited Time
            </div>
            <div style={{ fontFamily:'var(--font-heading)',fontSize:26,fontWeight:700,lineHeight:1.15,marginBottom:6 }}>
              Up to<br /><span style={{ fontSize:44, fontStyle:'italic' }}>50% Off</span>
            </div>
            <div style={{ opacity:0.8,fontSize:13,marginBottom:18 }}>
              On handpicked styles — today only
            </div>
            <button
              className="btn"
              style={{ background:'white',color:'var(--teal-darker)',padding:'10px 22px',
                borderRadius:'var(--r-full)',fontWeight:600,fontSize:13,letterSpacing:0.3 }}
              onClick={() => { setCat('all'); setSort('discount'); }}
            >
              Shop the Sale →
            </button>
          </div>
        </div>

        {/* ── PROMO STRIPS ── */}
        <div style={{ display:'flex', gap:10, padding:'14px 16px 0', overflowX:'auto' }}>
          {[
            { bg:'#FFF8E1', icon:'🚀', title:'Express Delivery', sub:'In 15 minutes', col:'#92400E' },
            { bg:'#F0FFF4', icon:'↩️', title:'Easy Returns',     sub:'7-day hassle free', col:'#14532D' },
            { bg:'#F3EEFF', icon:'💎', title:'Premium Quality',  sub:'Curated styles', col:'#5B21B6' },
          ].map(p => (
            <div key={p.title} style={{ flexShrink:0, background:p.bg, borderRadius:'var(--r-sm)',
              padding:'10px 14px', minWidth:130, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:p.col }}>{p.title}</div>
                <div style={{ fontSize:10, color:p.col, opacity:0.7, marginTop:1 }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ padding:'14px 0 0' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',marginBottom:10 }}>
            <span style={{ fontFamily:'var(--font-heading)',fontSize:16,fontWeight:700 }}>Browse</span>
          </div>
          <div ref={catRef} style={{ overflowX:'auto', display:'flex', gap:8, padding:'2px 16px 4px' }}>
            {CATS.map(c => (
              <button key={c.id} data-cat={c.id}
                className={`chip${cat===c.id?' active':''}`}
                style={{ flexShrink:0 }}
                onClick={() => handleCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SORT CHIPS ── */}
        <div style={{ overflowX:'auto', display:'flex', gap:8, padding:'10px 16px 0' }}>
          {SORTS.map(s => (
            <button key={s.val}
              className={`chip${sort===s.val?' active':''}`}
              style={{ flexShrink:0, padding:'5px 13px', fontSize:12 }}
              onClick={() => setSort(s.val)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS GRID ── */}
        <div style={{ padding:'14px 16px 0' }}>
          <div className="section-header">
            <span className="section-title">
              {cat === 'all' ? 'All Products' : cat}
            </span>
            <span style={{ fontSize:12, color:'var(--muted)', background:'var(--bg)', borderRadius:'var(--r-full)', padding:'3px 10px', fontWeight:600 }}>
              {products.length} items
            </span>
          </div>

          {loading ? (
            <div className="grid-2">
              {[...Array(6)].map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:600, fontSize:17 }}>No products found</div>
              <div style={{ color:'var(--muted)', fontSize:14, marginTop:6, marginBottom:20 }}>
                Try a different category
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => { setCat('all'); setSort(''); }}>
                Show All
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {products.map((p, i) => <ProductCard key={p.id} product={p} delay={Math.min(i*40,200)} />)}
            </div>
          )}
        </div>

        <div style={{ height:28 }} />
      </div>
    </div>
  );
}
