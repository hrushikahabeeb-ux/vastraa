const router = require('express').Router();
const { products, categories } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// GET /api/products
router.get('/', (req, res) => {
  let result = [...products];
  const { category, search, sort, minPrice, maxPrice, badge } = req.query;

  if (category && category !== 'all') {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase()
      || p.subcategory.toLowerCase().includes(category.toLowerCase())
      || p.tags.some((t) => t.toLowerCase().includes(category.toLowerCase())));
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q)
      || p.brand.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || p.tags.some((t) => t.includes(q)));
  }
  if (badge) result = result.filter((p) => p.badge === badge);
  if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));

  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') result.sort((a, b) => b.discount - a.discount);

  res.json({ success: true, products: result, total: result.length });
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  res.json({ success: true, categories });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const related = products.filter((p) => p.id !== product.id && (p.category === product.category || p.tags.some((t) => product.tags.includes(t)))).slice(0, 4);
  res.json({ success: true, product, related });
});

// POST /api/products/:id/wishlist  (toggle)
router.post('/:id/wishlist', authMiddleware, async (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const idx = user.wishlist.indexOf(req.params.id);
  if (idx === -1) {
    user.wishlist.push(req.params.id);
    await user.save();
    res.json({ success: true, wishlisted: true });
  } else {
    user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ success: true, wishlisted: false });
  }
});

// GET /api/products/wishlist/mine
router.get('/wishlist/mine', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const wishlistProducts = products.filter((p) => (user.wishlist || []).includes(p.id));
  res.json({ success: true, products: wishlistProducts });
});

module.exports = router;
