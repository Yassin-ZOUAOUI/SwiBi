require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/items', require('./src/routes/item.routes'));
app.use('/api/swipes', require('./src/routes/swipe.routes'));
app.use('/api/contacts', require('./src/routes/contact.routes'));
app.use('/api/messages', require('./src/routes/message.routes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 