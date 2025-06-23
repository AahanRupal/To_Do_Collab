require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
