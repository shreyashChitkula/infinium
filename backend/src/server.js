require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const analyticsRoutes = require('./routes/analytics');
const insuranceRoutes = require('./routes/insurance');

// Import database initializers
const { initializeDB } = require('./db');
const { initializeDatabase } = require('./db/init');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insurance', insuranceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [err.message]
  });
});

const PORT = process.env.PORT || 3001;

// Initialize database and sample data
async function initialize() {
    try {
        await initializeDatabase();
        console.log('Database and sample data initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initialize().catch(console.error);
});