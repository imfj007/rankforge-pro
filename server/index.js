require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const activateRoute = require('./routes/activate');
const seoAuditRoute = require('./routes/seoAudit');
const competitorRoute = require('./routes/competitor');
const dapaRoute = require('./routes/dapa');
const keywordsRoute = require('./routes/keywords');
const usageRoute = require('./routes/usage');
const adminRoute = require('./routes/admin');
const extensionRoute = require('./routes/extension');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/activate', activateRoute);
app.use('/api/seo-audit', seoAuditRoute);
app.use('/api/competitor', competitorRoute);
app.use('/api/da-pa', dapaRoute);
app.use('/api/keywords', keywordsRoute);
app.use('/api/usage', usageRoute);
app.use('/api/admin', adminRoute);
app.use('/api/extension', extensionRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 RankForge Pro API running on port ${PORT}`);
});
