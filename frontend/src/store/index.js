import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const getScopedStorage = (baseKey) => createJSONStorage(() => ({
  getItem: () => {
    try {
      const auth = JSON.parse(localStorage.getItem('vastra_auth') || '{}');
      const userId = auth?.state?.user?.id || auth?.user?.id || 'guest';
      return localStorage.getItem(`${baseKey}_${userId}`);
    } catch {
      return localStorage.getItem(`${baseKey}_guest`);
    }
  },
  setItem: (_name, value) => {
    try {
      const auth = JSON.parse(localStorage.getItem('vastra_auth') || '{}');
      const userId = auth?.state?.user?.id || auth?.user?.id || 'guest';
      localStorage.setItem(`${baseKey}_${userId}`, value);
    } catch {
      localStorage.setItem(`${baseKey}_guest`, value);
    }
  },
  removeItem: () => {
    try {
      const auth = JSON.parse(localStorage.getItem('vastra_auth') || '{}');
      const userId = auth?.state?.user?.id || auth?.user?.id || 'guest';
      localStorage.removeItem(`${baseKey}_${userId}`);
    } catch {
      localStorage.removeItem(`${baseKey}_guest`);
    }
  },
}));

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setAuth: (user, token) => {
        localStorage.setItem('vastra_token', token);
        set({ user, token, isLoggedIn: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('vastra_token');
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    { name: 'vastra_auth', partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }) }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const key = `${item.productId}_${item.size}_${item.color}`;
        const idx = items.findIndex(i => `${i.productId}_${i.size}_${i.color}` === key);
        if (idx !== -1) {
          const updated = [...items];
          updated[idx] = { ...updated[idx], qty: updated[idx].qty + (item.qty || 1) };
          set({ items: updated });
        } else {
          set({ items: [...items, { ...item, qty: item.qty || 1 }] });
        }
      },
      removeItem: (productId, size, color) => {
        set({ items: get().items.filter(i => !(i.productId === productId && i.size === size && i.color === color)) });
      },
      updateQty: (productId, size, color, qty) => {
        if (qty < 1) { get().removeItem(productId, size, color); return; }
        set({ items: get().items.map(i => i.productId === productId && i.size === size && i.color === color ? { ...i, qty } : i) });
      },
      clearCart: () => set({ items: [] }),
      get total() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
      get count() { return get().items.reduce((s, i) => s + i.qty, 0); },
    }),
    { name: 'vastra_cart', storage: getScopedStorage('vastra_cart') }
  )
);

// ─── Wishlist Store ───────────────────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] });
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'vastra_wishlist', storage: getScopedStorage('vastra_wishlist') }
  )
);

// ─── UI Store (no persistence) ───────────────────────────────────────────────
export const useUIStore = create((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  activeCategory: 'all',
  setActiveCategory: (c) => set({ activeCategory: c }),
}));
