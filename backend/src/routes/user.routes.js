const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        ville: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put(
  '/profile',
  auth,
  [
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('phone').optional().isString().trim().isLength({ min: 8 }),
    body('ville').optional().isString().trim().isLength({ min: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone, ville } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          name,
          phone,
          ville,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          ville: true,
          avatar: true,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
);

module.exports = router; 