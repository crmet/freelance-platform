const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SITE_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ── ENV (CI-safe) ─────────────────────────────
const isCI = process.env.CI === 'true';

if (process.env.NODE_ENV !== 'production' && !isCI) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

// ── Security ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    process.env.SITE_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// ── Rate Limit ────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
}));

// ── MongoDB (CI-safe) ─────────────────────────
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));
} else {
  console.warn('⚠️ MONGO_URI missing — skipping DB connection');
}

// ── Routes ────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/services', require('./routes/services'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── React build ───────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend-react/dist')));

// ── Healthcheck (IMPORTANT) ───────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState,
    env: process.env.NODE_ENV || 'development'
  });
});

// ── Socket.IO ────────────────────────────────
const Message = require('./models/Message');

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    if (typeof roomId === 'string' && roomId.length < 200) {
      socket.join(roomId);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data.room || !data.senderId || !data.text) return;

      const message = new Message({
        room: data.room,
        sender: data.senderId,
        text: data.text,
        createdAt: new Date()
      });

      await message.save();

      const populated = await Message.findById(message._id)
        .populate('sender', 'name avatar role');

      io.to(data.room).emit('receive_message', populated);

    } catch (err) {
      console.error('Message error:', err);
    }
  });
});

// ── Telegram bot ──────────────────────────────
const { startTelegramBot } = require('./utils/telegramBot');
startTelegramBot();

// ── Global error handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Server error'
      : err.message
  });
});

// ── React fallback ────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-react/dist/index.html'));
});

// ── Start server ──────────────────────────────
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

if (!process.env.MONGO_URI) {
  console.log("MONGO_URI missing");
}

if (!process.env.RESEND_API_KEY) {
  console.log("RESEND_API_KEY missing");
}