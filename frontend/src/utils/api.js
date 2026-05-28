import axios from 'axios';

const filterAndSortProducts = (products, params = {}) => {
  let result = [...products];
  const { category, search, sort, minPrice, maxPrice, badge } = params;

  if (category && category !== 'all') {
    const c = String(category).toLowerCase();
    result = result.filter(p =>
      p.category?.toLowerCase() === c ||
      p.subcategory?.toLowerCase().includes(c) ||
      p.tags?.some(t => t.toLowerCase().includes(c))
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  if (badge) result = result.filter(p => p.badge === badge);
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') result.sort((a, b) => b.discount - a.discount);

  return result;
};

const getMockCatalog = async () => {
  const res = await fetch('/mock-products.json');
  if (!res.ok) throw new Error('Unable to load local catalog');
  return res.json();
};


const AUTH_USERS_KEY = 'vastra_local_users';
const AUTH_OTP_KEY = 'vastra_local_otps';

const readLocalUsers = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]'); }
  catch { return []; }
};

const writeLocalUsers = (users) => {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
};

const readLocalOtps = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_OTP_KEY) || '{}'); }
  catch { return {}; }
};

const writeLocalOtps = (otps) => {
  localStorage.setItem(AUTH_OTP_KEY, JSON.stringify(otps));
};

const makeLocalToken = (userId) => `local-${userId}-${Date.now()}`;
const makeLocalId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const findLocalUserByToken = () => {
  const token = localStorage.getItem('vastra_token');
  if (!token?.startsWith('local-')) return null;
  const users = readLocalUsers();
  return users.find(u => token.includes(u.id)) || null;
};

const localAuthAPI = {
  signup: async (data) => {
    const users = readLocalUsers();
    const email = String(data.email || '').trim().toLowerCase();
    if (users.some(u => u.email === email && email)) {
      throw { message: 'Email already registered' };
    }
    const user = {
      id: makeLocalId(),
      firstName: data.firstName?.trim() || 'Vastra',
      lastName: data.lastName?.trim() || '',
      email,
      phone: String(data.phone || '').replace(/\D/g, '').slice(-10),
      password: data.password,
      avatar: null,
      wishlist: [],
      createdAt: new Date().toISOString(),
      coupons: ['WELCOME10', 'FIRST50'],
    };
    users.push(user);
    writeLocalUsers(users);
    return { success: true, user: sanitizeUser(user), token: makeLocalToken(user.id), offline: true };
  },
  login: async (data) => {
    const users = readLocalUsers();
    const email = String(data.email || '').trim().toLowerCase();
    const user = users.find(u => u.email === email || u.phone === email.replace(/\D/g, '').slice(-10));
    if (!user || user.password !== data.password) {
      throw { message: 'Invalid credentials' };
    }
    return { success: true, user: sanitizeUser(user), token: makeLocalToken(user.id), offline: true };
  },
  sendOtp: async (phone) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) throw { message: 'Phone required' };
    const otp = '1234';
    const otps = readLocalOtps();
    otps[cleanPhone] = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    writeLocalOtps(otps);
    return { success: true, message: 'OTP sent', otp, offline: true };
  },
  verifyOtp: async (phone, otp) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const otps = readLocalOtps();
    const record = otps[cleanPhone];
    if (!record || record.code !== String(otp) || Date.now() > record.expiresAt) {
      throw { message: 'Invalid OTP' };
    }
    delete otps[cleanPhone];
    writeLocalOtps(otps);
    const users = readLocalUsers();
    let user = users.find(u => u.phone === cleanPhone);
    if (!user) {
      user = {
        id: makeLocalId(),
        firstName: 'Vastra',
        lastName: 'User',
        email: '',
        phone: cleanPhone,
        password: '',
        avatar: null,
        wishlist: [],
        createdAt: new Date().toISOString(),
        coupons: ['WELCOME10'],
      };
      users.push(user);
      writeLocalUsers(users);
    }
    return { success: true, user: sanitizeUser(user), token: makeLocalToken(user.id), offline: true };
  },
  me: async () => {
    const user = findLocalUserByToken();
    if (!user) throw { message: 'User not found' };
    return { success: true, user: sanitizeUser(user), offline: true };
  },
  updateProfile: async (data) => {
    const tokenUser = findLocalUserByToken();
    if (!tokenUser) throw { message: 'User not found' };
    const users = readLocalUsers();
    const idx = users.findIndex(u => u.id === tokenUser.id);
    users[idx] = {
      ...users[idx],
      ...data,
      email: data.email ? String(data.email).trim().toLowerCase() : users[idx].email,
      phone: data.phone ? String(data.phone).replace(/\D/g, '').slice(-10) : users[idx].phone,
    };
    writeLocalUsers(users);
    return { success: true, user: sanitizeUser(users[idx]), offline: true };
  },
};



const getCurrentUserId = () => {
  const authState = (() => {
    try { return JSON.parse(localStorage.getItem('vastra_auth') || '{}'); }
    catch { return {}; }
  })();
  return authState?.state?.user?.id || authState?.user?.id || findLocalUserByToken()?.id || null;
};

const scopedKey = (base, userId = getCurrentUserId()) => `${base}_${userId || 'guest'}`;

const readScoped = (base, fallback) => {
  try { return JSON.parse(localStorage.getItem(scopedKey(base)) || JSON.stringify(fallback)); }
  catch { return fallback; }
};

const writeScoped = (base, value) => {
  localStorage.setItem(scopedKey(base), JSON.stringify(value));
};

const LOCAL_ADDRESS_KEY = 'vastra_local_addresses';
const LOCAL_ORDERS_KEY = 'vastra_local_orders';
const LOCAL_LAST_TRACK_KEY = 'vastra_local_last_track';

const getLocalAddresses = () => readScoped(LOCAL_ADDRESS_KEY, []);
const setLocalAddresses = (addresses) => writeScoped(LOCAL_ADDRESS_KEY, addresses);
const getLocalOrders = () => readScoped(LOCAL_ORDERS_KEY, []);
const setLocalOrders = (orders) => writeScoped(LOCAL_ORDERS_KEY, orders);

const couponCatalog = {
  WELCOME10: { type: 'percent', value: 10, max: 200 },
  FIRST50: { type: 'flat', value: 50 },
  VASTRA20: { type: 'percent', value: 20, max: 500 },
  SAVE100: { type: 'flat', value: 100, minOrder: 999 },
};

const calcCoupon = (code, subtotal) => {
  const coupon = couponCatalog[String(code || '').toUpperCase()];
  if (!coupon) return { success: true, valid: false, discount: 0, message: 'Invalid coupon code' };
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { success: true, valid: false, discount: 0, message: `Minimum order ₹${coupon.minOrder} required` };
  }
  let discount = coupon.type === 'percent'
    ? Math.min((subtotal * coupon.value) / 100, coupon.max || Infinity)
    : coupon.value;
  discount = Math.min(Math.round(discount), subtotal);
  return {
    success: true,
    valid: true,
    discount,
    message: coupon.type === 'percent' ? `${coupon.value}% off applied!` : `₹${coupon.value} off applied!`,
  };
};

const calculateBreakdown = (items = [], couponCode = null) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const coupon = couponCode ? calcCoupon(couponCode, subtotal) : { valid: false, discount: 0 };
  const afterDiscount = Math.max(0, subtotal - (coupon.discount || 0));
  const gst = Math.round(afterDiscount * 0.05);
  const total = afterDiscount + deliveryFee + gst;
  return { subtotal, deliveryFee, discount: coupon.discount || 0, gst, total, coupon };
};

const computeTracking = (placedAt) => {
  const stages = [
    { id: 'placed', label: 'Order Placed', duration: 0 },
    { id: 'confirmed', label: 'Order Confirmed', duration: 1 },
    { id: 'packed', label: 'Items Packed', duration: 3 },
    { id: 'picked', label: 'Picked Up by Rider', duration: 5 },
    { id: 'nearby', label: 'Rider Nearby', duration: 10 },
    { id: 'delivered', label: 'Delivered', duration: 15 },
  ];
  const elapsed = (Date.now() - new Date(placedAt).getTime()) / 60000;
  let currentStage = 0;
  stages.forEach((stage, index) => {
    if (elapsed >= stage.duration) currentStage = index;
  });
  const enriched = stages.map((stage, index) => ({
    ...stage,
    completed: index <= currentStage,
    active: index === currentStage,
    time: index <= currentStage
      ? new Date(new Date(placedAt).getTime() + stage.duration * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : null,
  }));
  return {
    stages: enriched,
    currentStage: stages[currentStage].id,
    eta: currentStage < stages.length - 1 ? Math.max(0, Math.round(stages[stages.length - 1].duration - elapsed)) : 0,
    delivered: currentStage === stages.length - 1,
    progress: Math.round((currentStage / (stages.length - 1)) * 100),
  };
};

const localAddressAPI = {
  getAll: async () => ({ success: true, addresses: getLocalAddresses(), offline: true }),
  add: async (data) => {
    const addresses = getLocalAddresses();
    const address = {
      id: makeLocalId(),
      label: data.label || 'Home',
      name: data.name,
      phone: String(data.phone || '').replace(/\D/g, '').slice(-10),
      line1: data.line1,
      line2: data.line2 || '',
      city: data.city,
      state: data.state || '',
      pincode: String(data.pincode || ''),
      isDefault: Boolean(data.isDefault || addresses.length === 0),
      createdAt: new Date().toISOString(),
    };
    const next = address.isDefault
      ? addresses.map(item => ({ ...item, isDefault: false })).concat(address)
      : addresses.concat(address);
    setLocalAddresses(next);
    return { success: true, address, offline: true };
  },
  update: async (id, data) => {
    const addresses = getLocalAddresses();
    const idx = addresses.findIndex(item => item.id === id);
    if (idx === -1) throw { message: 'Address not found' };
    const next = addresses.map(item => ({ ...item }));
    if (data.isDefault) next.forEach(item => { item.isDefault = false; });
    next[idx] = { ...next[idx], ...data };
    setLocalAddresses(next);
    return { success: true, address: next[idx], offline: true };
  },
  remove: async (id) => {
    const addresses = getLocalAddresses().filter(item => item.id !== id);
    if (addresses.length && !addresses.some(item => item.isDefault)) addresses[0].isDefault = true;
    setLocalAddresses(addresses);
    return { success: true, message: 'Address deleted', offline: true };
  },
  setDefault: async (id) => {
    const addresses = getLocalAddresses().map(item => ({ ...item, isDefault: item.id === id }));
    const address = addresses.find(item => item.id === id);
    if (!address) throw { message: 'Address not found' };
    setLocalAddresses(addresses);
    return { success: true, address, offline: true };
  },
};

const localOrdersAPI = {
  calculate: async (data) => ({ success: true, breakdown: calculateBreakdown(data.items || [], data.couponCode), offline: true }),
  validateCoupon: async (code, subtotal) => ({ ...calcCoupon(code, subtotal), offline: true }),
  place: async (data) => {
    const addresses = getLocalAddresses();
    const address = addresses.find(item => item.id === data.addressId);
    if (!address) throw { message: 'Address not found' };
    const breakdown = calculateBreakdown(data.items || [], data.couponCode);
    const order = {
      id: 'ORD' + Date.now().toString().slice(-8),
      userId: getCurrentUserId(),
      items: data.items || [],
      address,
      paymentMethod: data.paymentMethod || 'COD',
      couponCode: breakdown.coupon?.valid ? data.couponCode : null,
      breakdown: { subtotal: breakdown.subtotal, deliveryFee: breakdown.deliveryFee, discount: breakdown.discount, gst: breakdown.gst, total: breakdown.total },
      status: 'placed',
      placedAt: new Date().toISOString(),
      rider: {
        name: ['Arjun K.', 'Priya S.', 'Rohit M.', 'Sneha R.'][Math.floor(Math.random() * 4)],
        phone: '+91 98765' + Math.floor(10000 + Math.random() * 90000),
        rating: (4.2 + Math.random() * 0.7).toFixed(1),
      },
    };
    const orders = getLocalOrders();
    orders.unshift(order);
    setLocalOrders(orders);
    localStorage.setItem(LOCAL_LAST_TRACK_KEY, order.id);
    return { success: true, order: { ...order, tracking: computeTracking(order.placedAt) }, offline: true };
  },
  getAll: async () => {
    const orders = getLocalOrders().map(order => ({ ...order, tracking: computeTracking(order.placedAt) }));
    return { success: true, orders, offline: true };
  },
  getById: async (id) => {
    const order = getLocalOrders().find(item => item.id === id);
    if (!order) throw { message: 'Order not found' };
    return { success: true, order: { ...order, tracking: computeTracking(order.placedAt) }, offline: true };
  },
  track: async (id) => {
    const order = getLocalOrders().find(item => item.id === id);
    if (!order) throw { message: 'Order not found' };
    return { success: true, orderId: order.id, tracking: computeTracking(order.placedAt), rider: order.rider, offline: true };
  },
};

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vastra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vastra_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: 'Network error' });
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: async (data) => {
    try {
      return await api.post('/auth/signup', data);
    } catch (err) {
      return localAuthAPI.signup(data);
    }
  },
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (err) {
      return localAuthAPI.login(data);
    }
  },
  sendOtp: async (phone) => {
    try {
      return await api.post('/auth/send-otp', { phone });
    } catch (err) {
      return localAuthAPI.sendOtp(phone);
    }
  },
  verifyOtp: async (phone, otp) => {
    try {
      return await api.post('/auth/verify-otp', { phone, otp });
    } catch (err) {
      return localAuthAPI.verifyOtp(phone, otp);
    }
  },
  me: async () => {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      return localAuthAPI.me();
    }
  },
  updateProfile: async (data) => {
    try {
      return await api.put('/auth/profile', data);
    } catch (err) {
      return localAuthAPI.updateProfile(data);
    }
  },
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: async (params) => {
    try {
      return await api.get('/products', { params });
    } catch (err) {
      const catalog = await getMockCatalog();
      const products = filterAndSortProducts(catalog.products || [], params);
      return { success: true, products, total: products.length, offline: true };
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/products/${id}`);
    } catch (err) {
      const catalog = await getMockCatalog();
      const product = (catalog.products || []).find(p => p.id === id);
      if (!product) throw err;
      const related = (catalog.products || [])
        .filter(p => p.id !== product.id && (p.category === product.category || p.tags?.some(t => product.tags?.includes(t))))
        .slice(0, 4);
      return { success: true, product, related, offline: true };
    }
  },
  getCategories: async () => {
    try {
      return await api.get('/products/categories');
    } catch (err) {
      const catalog = await getMockCatalog();
      return { success: true, categories: catalog.categories || [], offline: true };
    }
  },
  toggleWishlist: (id) => api.post(`/products/${id}/wishlist`),
  getWishlist:  () => api.get('/products/wishlist/mine'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  calculate: async (data) => {
    try {
      return await api.post('/orders/calculate', data);
    } catch (err) {
      return localOrdersAPI.calculate(data);
    }
  },
  place: async (data) => {
    try {
      return await api.post('/orders', data);
    } catch (err) {
      return localOrdersAPI.place(data);
    }
  },
  getAll: async () => {
    try {
      return await api.get('/orders');
    } catch (err) {
      return localOrdersAPI.getAll();
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/orders/${id}`);
    } catch (err) {
      return localOrdersAPI.getById(id);
    }
  },
  track: async (id) => {
    try {
      return await api.get(`/orders/${id}/track`);
    } catch (err) {
      return localOrdersAPI.track(id);
    }
  },
  validateCoupon: async (code, subtotal) => {
    try {
      return await api.post('/orders/validate-coupon', { code, subtotal });
    } catch (err) {
      return localOrdersAPI.validateCoupon(code, subtotal);
    }
  },
};

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addressesAPI = {
  getAll: async () => {
    try {
      return await api.get('/addresses');
    } catch (err) {
      return localAddressAPI.getAll();
    }
  },
  add: async (data) => {
    try {
      return await api.post('/addresses', data);
    } catch (err) {
      return localAddressAPI.add(data);
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/addresses/${id}`, data);
    } catch (err) {
      return localAddressAPI.update(id, data);
    }
  },
  remove: async (id) => {
    try {
      return await api.delete(`/addresses/${id}`);
    } catch (err) {
      return localAddressAPI.remove(id);
    }
  },
  setDefault: async (id) => {
    try {
      return await api.put(`/addresses/${id}/default`);
    } catch (err) {
      return localAddressAPI.setDefault(id);
    }
  },
};

export default api;
