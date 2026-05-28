const router = require('express').Router();
const Address = require('../models/Address');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

const DELIVERY_FEE = 49;
const GST_RATE = 0.05;
const FREE_DELIVERY_THRESHOLD = 999;

const TRACKING_STAGES = [
  { id: 'placed', label: 'Order Placed', icon: '✓', duration: 0 },
  { id: 'confirmed', label: 'Order Confirmed', icon: '✓', duration: 1 },
  { id: 'packed', label: 'Items Packed', icon: '✓', duration: 3 },
  { id: 'picked', label: 'Picked Up by Rider', icon: '✓', duration: 5 },
  { id: 'nearby', label: 'Rider Nearby', icon: '✓', duration: 10 },
  { id: 'delivered', label: 'Delivered', icon: '✓', duration: 15 },
];

function computeTracking(placedAt) {
  const elapsed = (Date.now() - new Date(placedAt).getTime()) / 60000;
  let currentStage = 0;
  for (let i = 0; i < TRACKING_STAGES.length; i += 1) {
    if (elapsed >= TRACKING_STAGES[i].duration) currentStage = i;
  }
  return {
    stages: TRACKING_STAGES.map((s, i) => ({
      ...s,
      completed: i <= currentStage,
      active: i === currentStage,
      time: i <= currentStage
        ? new Date(new Date(placedAt).getTime() + s.duration * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : null,
    })),
    currentStage: TRACKING_STAGES[currentStage].id,
    eta: currentStage < TRACKING_STAGES.length - 1
      ? Math.max(0, Math.round(TRACKING_STAGES[TRACKING_STAGES.length - 1].duration - elapsed))
      : 0,
    delivered: currentStage === TRACKING_STAGES.length - 1,
  };
}

function applyCoupon(code, subtotal) {
  const coupons = {
    WELCOME10: { type: 'percent', value: 10, max: 200 },
    FIRST50: { type: 'flat', value: 50 },
    VASTRA20: { type: 'percent', value: 20, max: 500 },
    SAVE100: { type: 'flat', value: 100, minOrder: 999 },
  };
  const coupon = coupons[code?.toUpperCase()];
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { valid: false, discount: 0, message: `Minimum order ₹${coupon.minOrder} required` };
  }
  let discount = coupon.type === 'percent'
    ? Math.min((subtotal * coupon.value) / 100, coupon.max || Infinity)
    : coupon.value;
  discount = Math.min(discount, subtotal);
  return { valid: true, discount: Math.round(discount), message: `${coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`} applied!` };
}

// POST /api/orders/calculate
router.post('/calculate', authMiddleware, (req, res) => {
  const { items, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'No items' });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const couponResult = couponCode ? applyCoupon(couponCode, subtotal) : { valid: false, discount: 0 };
  const afterCoupon = subtotal - (couponResult.discount || 0);
  const gst = Math.round(afterCoupon * GST_RATE);
  const total = afterCoupon + deliveryFee + gst;
  res.json({ success: true, breakdown: { subtotal, deliveryFee, discount: couponResult.discount || 0, gst, total, coupon: couponResult } });
});

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  const { items, addressId, paymentMethod, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'No items' });
  if (!addressId) return res.status(400).json({ success: false, message: 'Address required' });

  const address = await Address.findOne({ _id: addressId, userId: req.userId }).lean();
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const couponResult = couponCode ? applyCoupon(couponCode, subtotal) : { valid: false, discount: 0 };
  const afterCoupon = subtotal - (couponResult.discount || 0);
  const gst = Math.round(afterCoupon * GST_RATE);
  const total = afterCoupon + deliveryFee + gst;

  const order = await Order.create({
    orderCode: 'ORD' + Date.now().toString().slice(-8),
    userId: req.userId,
    items,
    address: {
      label: address.label,
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    },
    paymentMethod: paymentMethod || 'COD',
    couponCode: couponResult.valid ? couponCode : null,
    breakdown: { subtotal, deliveryFee, discount: couponResult.discount || 0, gst, total },
    status: 'placed',
    placedAt: new Date(),
    rider: {
      name: ['Arjun K.', 'Priya S.', 'Rohit M.', 'Sneha R.'][Math.floor(Math.random() * 4)],
      phone: '+91 98765' + Math.floor(10000 + Math.random() * 90000),
      rating: (4.2 + Math.random() * 0.7).toFixed(1),
    },
  });

  res.status(201).json({ success: true, order: { ...order.toObject(), id: order.orderCode } });
});

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    orders: orders.map((o) => ({
      ...o,
      id: o.orderCode,
      tracking: computeTracking(o.placedAt),
    })),
  });
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const order = await Order.findOne({ orderCode: req.params.id, userId: req.userId }).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({
    success: true,
    order: {
      ...order,
      id: order.orderCode,
      tracking: computeTracking(order.placedAt),
    },
  });
});

// GET /api/orders/:id/track
router.get('/:id/track', authMiddleware, async (req, res) => {
  const order = await Order.findOne({ orderCode: req.params.id, userId: req.userId }).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, orderId: order.orderCode, tracking: computeTracking(order.placedAt), rider: order.rider });
});

// POST /api/orders/validate-coupon
router.post('/validate-coupon', authMiddleware, (req, res) => {
  const { code, subtotal } = req.body;
  const result = applyCoupon(code, subtotal);
  res.json({ success: true, ...result });
});

module.exports = router;
