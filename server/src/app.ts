import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './config/database';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Экспортируем supabase для использования в других файлах
export { supabase };

// Socket.IO
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Проверка работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket обработчики
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});