import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { Icon } from '../components/shared';
import { useWishlistStore, useUIStore } from '../store';

const TRENDING = ['Kurti', 'Anarkali', 'Shirt', 'Palazzo', 'Blazer', 'Kids Ethnic'];

export default function Search() {
  const nav = useNavigate();
  const inputRef = useRef();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('vastra_recent') || '[]'));

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getAll({ search: query });
        setResults(res.products);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const saveRecent = (term) => {
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 6);
    setRecent(updated);
    localStorage.setItem('vastra_recent', JSON.stringify(updated));
  };

  const handleSelect = (term) => {
    saveRecent(term);
    nav(`/search?q=${encodeURIComponent(term)}`);
  };

  const { has, toggle } = useWishlistStore();
  const { showToast } = useUIStore();

  return (
    <div className="screen">
      {/* Search Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button className="btn btn-icon btn-ghost" onClick={() => nav(-1)}><Icon.Back /></button>
        <div className="search-bar" style={{ flex: 1 }}>
          <Icon.Search />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search clothes, brands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && handleSelect(query.trim())}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, fontSize: 18 }}>×</button>
          )}
        </div>
      </div>

      <div className="screen-scroll" style={{ padding: '16px' }}>
        {!query ? (
          <>
            {recent.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Recent Searches</span>
                  <button onClick={() => { setRecent([]); localStorage.removeItem('vastra_recent'); }} style={{ fontSize: 12, color: 'var(--teal-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recent.map(r => (
                    <button key={r} className="chip" onClick={() => { setQuery(r); }} style={{ fontSize: 13 }}>
                      🕐 {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Trending Now</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TRENDING.map(t => (
                  <button key={t} className="chip" onClick={() => setQuery(t)} style={{ fontSize: 13 }}>
                    🔥 {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTop: '3px solid var(--teal-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: 17 }}>No results for "{query}"</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Try a different keyword</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>{results.length} results for "{query}"</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map(p => (
                <div key={p.id} onClick={() => { saveRecent(query); nav(`/product/${p.id}`); }}
                  style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: 70, height: 90, objectFit: 'cover', borderRadius: 'var(--r-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{p.brand}</div>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>{p.discount}% off</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--teal-dark)', marginTop: 6, fontWeight: 500 }}>⚡ {p.deliveryTime} delivery</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggle(p.id); showToast(has(p.id) ? 'Removed from wishlist' : 'Added to wishlist'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', color: has(p.id) ? 'var(--danger)' : 'var(--muted)', paddingTop: 2 }}>
                    <Icon.Heart filled={has(p.id)} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
