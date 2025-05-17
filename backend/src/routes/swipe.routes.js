const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get items to swipe on (excluding user's own items and already swiped items)
router.get('/discover', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Current user ID:', userId);

    // Get user's swipes
    const userSwipes = await prisma.swipe.findMany({
      where: { userId },
      select: { itemId: true },
    });
    console.log('User swipes:', userSwipes);

    const swipedItemIds = userSwipes.map((swipe) => swipe.itemId);
    console.log('Swiped item IDs:', swipedItemIds);

    // First, let's get all items to verify they exist
    const allItems = await prisma.item.findMany();
    console.log('All items in database:', allItems);

    // Log items by seller for debugging
    console.log('Items grouped by seller:');
    const itemsBySeller = {};
    allItems.forEach(item => {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = [];
      }
      itemsBySeller[item.sellerId].push({
        title: item.title,
        status: item.status,
        id: item.id
      });
    });
    console.log(itemsBySeller);

    // Get items to show - first try without status filter
    const items = await prisma.item.findMany({
      where: {
        sellerId: { not: userId },
        id: { notIn: swipedItemIds },
        status: { not: 'DELETED' }, // More lenient - show both ACTIVE and SOLD items
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        seller: {
          select: {
            name: true,
            ville: true,
          },
        },
      },
    });
    console.log('Filtered items for swiping:', items);
    console.log('Number of items after filtering:', items.length);
    console.log('Filter conditions used:');
    console.log('- Not own items (sellerId != ', userId, ')');
    console.log('- Not already swiped (id not in ', swipedItemIds, ')');
    console.log('- Status is not DELETED');

    // If no items found, try without any status filter to debug
    if (items.length === 0) {
      console.log('No items found with status filter, trying without status filter');
      const itemsNoStatusFilter = await prisma.item.findMany({
        where: {
          sellerId: { not: userId },
          id: { notIn: swipedItemIds },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          seller: {
            select: {
              name: true,
              ville: true,
            },
          },
        },
      });
      console.log('Items without status filter:', itemsNoStatusFilter);
    }

    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record a swipe
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, direction } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!itemId || !direction || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create swipe record
    const swipe = await prisma.swipe.create({
      data: {
        userId,
        itemId,
        direction,
      },
    });

    // If it's a right swipe, create a contact
    if (direction === 'right') {
      // Check if contact already exists
      const existingContact = await prisma.contact.findFirst({
        where: {
          userId,
          itemId,
        },
      });

      if (!existingContact) {
        await prisma.contact.create({
          data: {
            userId,
            itemId,
            status: 'PENDING',
          },
        });
      }
    }

    res.status(201).json(swipe);
  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's matches (items they swiped right on)
router.get('/matches', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const matches = await prisma.swipe.findMany({
      where: {
        userId,
        direction: 'right',
      },
      include: {
        item: {
          include: {
            seller: {
              select: {
                name: true,
                ville: true,
              },
            },
          },
        },
      },
    });

    res.json(matches.map((match) => match.item));
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 