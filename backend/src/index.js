import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authroute.js';
import messageRoutes from './routes/messageroute.js';
import { connectDB } from './lib/db.js';


import path from 'path';





dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);




// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
    credentials: true
  }
});

// CORS setup to allow localhost:5000 and 127.0.0.1:5000
const corsOptions = {
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,  // Allow cookies (if you're sending cookies, e.g., for JWTs)
};

app.use(cors(corsOptions));  // Apply CORS middleware



app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);



// ------------------------------------Deployment------------------------------







// Serve static files from the frontend directory in production
const __dirname1 = path.resolve();



if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname1, 'frontend'))); // Serve static files from 'frontend' folder

  // Serve index.html when visiting the root in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname1, 'frontend', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is Running Successfully');
  });
}













// ------------------------------------Deployment------------------------------

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
    
    // You can emit to a specific user if you manage socket IDs properly
    socket.broadcast.emit('receiveMessage', {
      senderId,
      message
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
