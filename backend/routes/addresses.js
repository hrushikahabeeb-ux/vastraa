const router = require('express').Router();
const Address = require('../models/Address');
const authMiddleware = require('../middleware/auth');

// GET /api/addresses
router.get('/', authMiddleware, async (req, res) => {
  const addresses = await Address.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, addresses: addresses.map(a => ({ ...a, id: a._id })) });
});

// POST /api/addresses
router.post('/', authMiddleware, async (req, res) => {
  const { label, name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
  if (!name || !phone || !line1 || !city || !pincode) {
    return res.status(400).json({ success: false, message: 'Name, phone, address, city and pincode required' });
  }

  if (isDefault) {
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
  }

  const existingCount = await Address.countDocuments({ userId: req.userId });

  const address = await Address.create({
    userId: req.userId,
    label: label || 'Home',
    name,
    phone,
    line1,
    line2: line2 || '',
    city,
    state: state || '',
    pincode,
    isDefault: Boolean(isDefault) || existingCount === 0,
  });

  res.status(201).json({ success: true, address: { ...address.toObject(), id: address._id } });
});

// PUT /api/addresses/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { label, name, phone, line1, line2, city, state, pincode, isDefault } = req.body;

  const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

  if (isDefault) {
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
  }

  address.label = label ?? address.label;
  address.name = name ?? address.name;
  address.phone = phone ?? address.phone;
  address.line1 = line1 ?? address.line1;
  address.line2 = line2 ?? address.line2;
  address.city = city ?? address.city;
  address.state = state ?? address.state;
  address.pincode = pincode ?? address.pincode;
  address.isDefault = isDefault ?? address.isDefault;

  await address.save();

  res.json({ success: true, address: { ...address.toObject(), id: address._id } });
});

// DELETE /api/addresses/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const deleted = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ success: false, message: 'Address not found' });

  res.json({ success: true, message: 'Address deleted' });
});

// PUT /api/addresses/:id/default
router.put('/:id/default', authMiddleware, async (req, res) => {
  await Address.updateMany({ userId: req.userId }, { isDefault: false });
  const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

  address.isDefault = true;
  await address.save();

  res.json({ success: true, address: { ...address.toObject(), id: address._id } });
});

module.exports = router;
