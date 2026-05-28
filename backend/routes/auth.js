const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'vastra_secret';
const sign = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
const otpStore = {};

function safeUser(userDoc) {
  return {
    id: userDoc._id,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    phone: userDoc.phone,
    avatar: userDoc.avatar,
    wishlist: userDoc.wishlist || [],
    coupons: userDoc.coupons || [],
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, email and password required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    if (normalizedPhone) {
      const existingPhone = await User.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Phone already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName: lastName || '',
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      avatar: null,
      wishlist: [],
      coupons: ['WELCOME10', 'FIRST50'],
    });

    const token = sign(user._id.toString());
    res.status(201).json({ success: true, token, user: safeUser(user) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email / phone and password required' });
    }

    const loginId = String(email).trim();
    const normalizedEmail = loginId.toLowerCase();
    const normalizedPhone = loginId.replace(/\D/g, '').slice(-10);

    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = sign(user._id.toString());
    res.json({ success: true, token, user: safeUser(user) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });

  const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[normalizedPhone] = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  console.log(`[OTP] ${normalizedPhone} → ${otp}`);
  res.json({ success: true, message: 'OTP sent', ...(process.env.NODE_ENV !== 'production' && { otp }) });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const phone = String(req.body.phone || '').replace(/\D/g, '').slice(-10);
  const { otp } = req.body;
  const record = otpStore[phone];

  if (!record || record.code !== otp || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  delete otpStore[phone];

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      firstName: 'Vastra',
      lastName: 'User',
      email: '',
      phone,
      password: '',
      avatar: null,
      wishlist: [],
      coupons: ['WELCOME10'],
    });
  }

  const token = sign(user._id.toString());
  res.json({ success: true, token, user: safeUser(user) });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user: safeUser(user) });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { firstName, lastName, email, phone } = req.body;

  if (firstName) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  if (email) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    user.email = normalizedEmail;
  }

  if (phone) {
    const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
    const existingPhone = await User.findOne({ phone: normalizedPhone, _id: { $ne: user._id } });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'Phone already registered' });
    }
    user.phone = normalizedPhone;
  }

  await user.save();
  res.json({ success: true, user: safeUser(user) });
});

module.exports = router;
