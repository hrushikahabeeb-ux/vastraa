import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useCartStore, useWishlistStore, useUIStore } from '../store';
import { Icon, Stars, Spinner } from '../components/shared';

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addItem } = useCartStore();
  const { has, toggle } = useWishlistStore();
  const { showToast } = useUIStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgErr, setImgErr] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setLoading(true); setImgIdx(0); setImgErr({});
    productsAPI.getById(id)
      .then(res => {
        setProduct(res.product);
        setRelated(res.related);
        setSelectedSize(res.product.sizes[Math.min(2, res.product.sizes.length-1)]);
      })
      .catch(() => nav(-1))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="screen flex-center">
      <Spinner size={40} />
    </div>
  );
  if (!product) return null;

  const wished = has(product.id);
  const savings = product.originalPrice - product.price;

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    addItem({
      productId: product.id, name: product.name, brand: product.brand,
      price: product.price, image: product.images[0],
      size: selectedSize, color: product.colorNames[selectedColorIdx], qty,
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
    showToast(`Added to cart — ${selectedSize} / ${product.colorNames[selectedColorIdx]}`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    addItem({
      productId: product.id, name: product.name, brand: product.brand,
      price: product.price, image: product.images[0],
      size: selectedSize, color: product.colorNames[selectedColorIdx], qty,
    });
    nav('/checkout');
  };

  const handleWishlist = async () => {
    toggle(product.id);
    try { await productsAPI.toggleWishlist(product.id); } catch {}
    showToast(wished ? 'Removed from wishlist' : 'Saved to wishlist ♡');
  };

  return (
    <div className="screen">
      {/* ── IMAGE VIEWER ── */}
      <div style={{ position:'relative', background:'var(--teal-xxlight)', flexShrink:0 }}>
        {imgErr[imgIdx] ? (
          <div style={{ width:'100%', height:380, display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:12, background:'var(--teal-xxlight)' }}>
            <span style={{ fontSize:64 }}>👗</span>
            <span style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'0 24px' }}>{product.name}</span>
            <span style={{ fontSize:11, color:'var(--muted2)', background:'var(--bg)', padding:'4px 12px', borderRadius:20 }}>
              Add image: /products/product{id.replace('p','')}.jpg
            </span>
          </div>
        ) : (
          <img src={product.images[imgIdx]} alt={product.name}
            style={{ width:'100%', height:380, objectFit:'cover', display:'block' }}
            onError={() => setImgErr(p => ({ ...p, [imgIdx]: true }))} />
        )}

        {/* Back */}
        <button onClick={() => nav(-1)} style={{
          position:'absolute', top:14, left:14,
          background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)',
          border:'none', borderRadius:'50%', width:40, height:40,
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          boxShadow:'0 2px 12px rgba(0,0,0,0.12)'
        }}>
          <Icon.Back />
        </button>

        {/* Wishlist */}
        <button onClick={handleWishlist} style={{
          position:'absolute', top:14, right:54,
          background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)',
          border:'none', borderRadius:'50%', width:40, height:40,
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          color: wished ? 'var(--danger)' : 'var(--muted)',
          boxShadow:'0 2px 12px rgba(0,0,0,0.12)', transition:'transform 0.15s'
        }}>
          <Icon.Heart filled={wished} />
        </button>

        {/* Share */}
        <button style={{
          position:'absolute', top:14, right:10,
          background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)',
          border:'none', borderRadius:'50%', width:40, height:40,
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          color:'var(--muted)', boxShadow:'0 2px 12px rgba(0,0,0,0.12)'
        }}
          onClick={() => { if(navigator.share) { navigator.share({ title:product.name, url:window.location.href }); } else showToast('Link copied!'); }}>
          <Icon.Share />
        </button>

        {/* Delivery badge */}
        <div style={{ position:'absolute', bottom:14, left:14,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
          color:'white', fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:20 }}>
          ⚡ {product.deliveryTime} delivery
        </div>

        {/* Image thumbnails */}
        {product.images.length > 1 && (
          <div style={{ position:'absolute', bottom:14, right:14, display:'flex', gap:6 }}>
            {product.images.map((_,i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{
                width: i===imgIdx?22:8, height:8, borderRadius:4,
                background: i===imgIdx ? 'white' : 'rgba(255,255,255,0.5)',
                border:'none', cursor:'pointer', transition:'width 0.25s',
              }} />
            ))}
          </div>
        )}
      </div>

      <div className="screen-scroll">
        <div style={{ padding:'16px 16px 0' }}>
          {/* ── TITLE & BADGE ── */}
          <div className="flex-between" style={{ alignItems:'flex-start', marginBottom:8 }}>
            <div style={{ flex:1, marginRight:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>
                {product.brand}
              </div>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700, lineHeight:1.2, color:'var(--text)' }}>
                {product.name}
              </div>
            </div>
            {product.badge && (
              <span style={{ flexShrink:0, background:'var(--teal-xlight)', color:'var(--teal-darker)',
                fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, letterSpacing:0.5 }}>
                {product.badge}
              </span>
            )}
          </div>

          {/* ── RATING ── */}
          <div style={{ marginBottom:12 }}>
            <Stars rating={product.rating} reviews={product.reviewCount} />
          </div>

          {/* ── PRICE ── */}
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:6 }}>
            <span style={{ fontSize:28, fontWeight:800, letterSpacing:-0.5 }}>₹{product.price.toLocaleString('en-IN')}</span>
            <span style={{ fontSize:16, color:'var(--muted)', textDecoration:'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:18 }}>
            <span style={{ background:'var(--success-bg)', color:'var(--success)', fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
              {product.discount}% OFF
            </span>
            <span style={{ background:'#FFF8E1', color:'#92400E', fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          </div>

          {/* ── SIZE ── */}
          <div style={{ marginBottom:18 }}>
            <div className="flex-between" style={{ marginBottom:10 }}>
              <span style={{ fontWeight:700, fontSize:14 }}>
                Size
                {selectedSize && <span style={{ color:'var(--teal-dark)', fontWeight:500, marginLeft:8 }}>{selectedSize}</span>}
              </span>
              <button style={{ fontSize:12, color:'var(--teal-dark)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                Size Guide ↗
              </button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {product.sizes.map(s => (
                <button key={s} className={`size-btn${selectedSize===s?' selected':''}`} onClick={() => setSelectedSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── COLOUR ── */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>
              Colour: <span style={{ color:'var(--teal-dark)', fontWeight:500 }}>{product.colorNames[selectedColorIdx]}</span>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {product.colors.map((c,i) => (
                <button key={i} className={`color-swatch${i===selectedColorIdx?' selected':''}`}
                  style={{ background:c }} title={product.colorNames[i]}
                  onClick={() => setSelectedColorIdx(i)} />
              ))}
            </div>
          </div>

          {/* ── QTY ── */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>Qty</span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))}><Icon.Minus /></button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(10,q+1))}><Icon.Plus /></button>
            </div>
          </div>

          {/* ── DETAILS TABS ── */}
          <div style={{ borderBottom:'2px solid var(--border2)', display:'flex', marginBottom:16 }}>
            {[['desc','Description'],['delivery','Delivery'],['returns','Returns']].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex:1, padding:'10px 0', fontWeight: tab===key ? 700 : 400,
                fontSize:13, color: tab===key ? 'var(--teal-dark)' : 'var(--muted)',
                borderBottom: tab===key ? '2px solid var(--teal-dark)' : '2px solid transparent',
                marginBottom:-2, background:'none', border:'none',
                borderBottomWidth:2, cursor:'pointer', transition:'all 0.18s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'desc' && (
            <p style={{ fontSize:14, lineHeight:1.75, color:'var(--text2)' }}>{product.description}</p>
          )}
          {tab === 'delivery' && (
            <div style={{ fontSize:14, lineHeight:2, color:'var(--muted)' }}>
              <div>⚡ <strong style={{color:'var(--text)'}}>Express</strong> — {product.deliveryTime} to your door</div>
              <div>📦 <strong style={{color:'var(--text)'}}>Same-day</strong> for all orders before 8 PM</div>
              <div>🆓 <strong style={{color:'var(--text)'}}>Free delivery</strong> on orders above ₹999</div>
              <div>📍 Available in 50+ cities across India</div>
            </div>
          )}
          {tab === 'returns' && (
            <div style={{ fontSize:14, lineHeight:2, color:'var(--muted)' }}>
              <div>↩️ <strong style={{color:'var(--text)'}}>7-day returns</strong> — no questions asked</div>
              <div>✅ <strong style={{color:'var(--text)'}}>Easy pickup</strong> — we collect from your door</div>
              <div>💳 <strong style={{color:'var(--text)'}}>Instant refund</strong> within 24–48 hours</div>
              <div>🏷️ Item must be unused with original tags</div>
            </div>
          )}

          {/* ── RELATED ── */}
          {related.length > 0 && (
            <div style={{ marginTop:28, marginBottom:8 }}>
              <div className="section-header">
                <span className="section-title">You May Also Like</span>
              </div>
              <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
                {related.slice(0,5).map(r => (
                  <div key={r.id} onClick={() => nav(`/product/${r.id}`)}
                    style={{ flexShrink:0, width:120, cursor:'pointer' }}>
                    <div style={{ width:120, height:150, borderRadius:'var(--r-sm)', background:'var(--teal-xxlight)', overflow:'hidden' }}>
                      <img src={r.images[0]} alt={r.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { e.target.style.display='none'; }} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, marginTop:6, lineHeight:1.3 }}>{r.name}</div>
                    <div style={{ fontSize:12, color:'var(--teal-dark)', fontWeight:700, marginTop:2 }}>₹{r.price.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ height:20 }} />
        </div>
      </div>

      {/* ── CTA BUTTONS ── */}
      <div className="sticky-bottom" style={{ display:'flex', gap:10 }}>
        <button
          className={`btn btn-outline${addedAnim?' btn-success':''}`}
          style={{ flex:1, transition:'all 0.3s', background: addedAnim ? 'var(--success)' : '', color: addedAnim ? 'white' : '', borderColor: addedAnim ? 'var(--success)' : '' }}
          onClick={handleAddToCart}
        >
          {addedAnim ? <><Icon.Check /> Added!</> : <><Icon.Cart /> Add to Cart</>}
        </button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={handleBuyNow}>
          Buy Now →
        </button>
      </div>
    </div>
  );
}
