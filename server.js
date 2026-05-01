import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const DB_FILE = path.join(process.cwd(), 'db.json');

let globalData = { decks: [], words: [] };

// Load from file if exists
if (fs.existsSync(DB_FILE)) {
  try {
    globalData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    console.error("Error reading db.json", e);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('request-sync', () => {
    socket.emit('initial-sync', globalData);
  });

  socket.on('update-data', (data) => {
    globalData = data;
    // Save to file
    fs.writeFileSync(DB_FILE, JSON.stringify(globalData));
    // Broadcast to all OTHER clients
    socket.broadcast.emit('sync-data', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Sync server running on port ${PORT}`);
});
