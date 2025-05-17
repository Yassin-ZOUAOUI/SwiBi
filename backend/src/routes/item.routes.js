const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's items
router.get('/my-items', auth, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        sellerId: req.user.userId,
        status: { not: 'DELETED' },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// Create new item
router.post(
  '/',
  auth,
  [
    body('title').isString().trim().isLength({ min: 3 }),
    body('description').isString().trim().isLength({ min: 10 }),
    body('price').isFloat({ min: 0 }),
    body('ville').isString().trim().isLength({ min: 2 }),
    body('category').isString().trim().isLength({ min: 2 }),
    body('images').isArray().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, price, ville, category, images } = req.body;

      const item = await prisma.item.create({
        data: {
          title,
          description,
          price,
          ville,
          category,
          images,
          seller: {
            connect: { id: req.user.userId },
          },
        },
      });

      res.status(201).json(item);
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ message: 'Error creating item' });
    }
  }
);

// Update item
router.put(
  '/:id',
  auth,
  [
    body('title').optional().isString().trim().isLength({ min: 3 }),
    body('description').optional().isString().trim().isLength({ min: 10 }),
    body('price').optional().isFloat({ min: 0 }),
    body('ville').optional().isString().trim().isLength({ min: 2 }),
    body('category').optional().isString().trim().isLength({ min: 2 }),
    body('images').optional().isArray(),
    body('status').optional().isIn(['ACTIVE', 'SOLD', 'DELETED']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Check if item exists and belongs to user
      const existingItem = await prisma.item.findFirst({
        where: {
          id,
          sellerId: req.user.userId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const item = await prisma.item.update({
        where: { id },
        data: updateData,
      });

      res.json(item);
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ message: 'Error updating item' });
    }
  }
);

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: {
        id,
        sellerId: req.user.userId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Soft delete by updating status
    await prisma.item.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
});

// Mark item as sold
router.patch('/:id/sell', auth, async (req, res) => {
  try {
    // Verify the user is the seller
    const item = await prisma.item.findFirst({
      where: {
        id: req.params.id,
        sellerId: req.user.userId,
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or you are not the seller' });
    }

    // Update item status to SOLD
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: { status: 'SOLD' },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error marking item as sold:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 