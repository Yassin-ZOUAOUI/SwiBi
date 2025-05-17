const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's contacts (both as buyer and seller)
router.get('/', auth, async (req, res) => {
  try {
    // Get contacts where user is the buyer (they swiped right)
    const sentContacts = await prisma.contact.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get contacts where user is the seller
    const receivedContacts = await prisma.contact.findMany({
      where: {
        item: {
          sellerId: req.user.userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        item: true,
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      sent: sentContacts,
      received: receivedContacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contact details
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.userId },
          { item: { sellerId: req.user.userId } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update contact status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        item: { sellerId: req.user.userId },
      },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // If accepting the contact, create a conversation
    if (status === 'ACCEPTED') {
      const updatedContact = await prisma.$transaction(async (prisma) => {
        // Update contact status
        const contact = await prisma.contact.update({
          where: { id: req.params.id },
          data: { status },
        });

        // Create conversation
        const conversation = await prisma.conversation.create({
          data: {
            contactId: contact.id,
          },
        });

        // Return updated contact with conversation
        return prisma.contact.findUnique({
          where: { id: contact.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            item: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            conversation: {
              select: {
                id: true,
              },
            },
          },
        });
      });

      return res.json(updatedContact);
    }

    // If not accepting, just update the status
    const updatedContact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contact by conversation ID
router.get('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        conversation: {
          id: req.params.conversationId,
        },
        OR: [
          { userId: req.user.userId },
          { item: { sellerId: req.user.userId } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 