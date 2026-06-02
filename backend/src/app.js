const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const faqRoutes = require('./routes/faq.routes');
const answerRoutes = require('./routes/answer.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/faqs', faqRoutes);
app.use('/answers', answerRoutes);
app.use('/users', userRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/samagama';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
