const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 10_000,
  cors: { origin: false }
});

const PORT = process.env.PORT || 3000;
const MAX_ROOM_MEMBERS = 2;
const PUBLIC_DIR = path.join(__dirname, "public");
const INDEX_FILE = path.join(PUBLIC_DIR, "index.html");

app.disable("x-powered-by");

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Serve the main page explicitly.
app.get("/", (_req, res) => {
  if (!fs.existsSync(INDEX_FILE)) {
    return res.status(500).send(
      "index.html not found. Please check the public folder."
    );
  }

  res.sendFile(INDEX_FILE);
});

// Serve CSS, JavaScript and other public assets.
app.use(express.static(PUBLIC_DIR, { maxAge: "1h" }));

function cleanText(value, max = 500) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function getRoomCount(roomCode) {
  return io.sockets.adapter.rooms.get(roomCode)?.size || 0;
}

io.on("connection", (socket) => {
  socket.data.lastMessageAt = 0;

  socket.on("join-room", (payload = {}) => {
    const name = cleanText(payload.name, 24);
    const roomCode = cleanText(payload.roomCode, 32)
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");

    if (!name || roomCode.length < 6) {
      socket.emit(
        "join-error",
        "Enter your name and a room code with at least 6 letters/numbers."
      );
      return;
    }

    const previousRoom = socket.data.roomCode;

    if (previousRoom === roomCode && socket.rooms.has(roomCode)) {
      socket.emit("joined", {
        name,
        roomCode,
        rejoined: true
      });
      return;
    }

    if (previousRoom) {
      socket.to(previousRoom).emit(
        "system-message",
        `${socket.data.chatName} left the chat.`
      );

      socket.leave(previousRoom);

      io.to(previousRoom).emit(
        "room-count",
        getRoomCount(previousRoom)
      );

      socket.data.roomCode = null;
      socket.data.chatName = null;
    }

    if (getRoomCount(roomCode) >= MAX_ROOM_MEMBERS) {
      socket.emit(
        "join-error",
        "This room already has two people. Check the room code or create a new one."
      );
      return;
    }

    socket.data.chatName = name;
    socket.data.roomCode = roomCode;

    socket.join(roomCode);

    socket.emit("joined", { name, roomCode });

    socket.to(roomCode).emit(
      "system-message",
      `${name} joined the chat.`
    );

    io.to(roomCode).emit(
      "room-count",
      getRoomCount(roomCode)
    );
  });

  socket.on("chat-message", (rawMessage) => {
    const message = cleanText(rawMessage, 500);
    const roomCode = socket.data.roomCode;
    const name = socket.data.chatName;

    if (!roomCode || !name || !message) return;

    const now = Date.now();

    if (now - socket.data.lastMessageAt < 250) return;

    socket.data.lastMessageAt = now;

    io.to(roomCode).emit("chat-message", {
      name,
      message,
      time: new Date().toISOString(),
      senderId: socket.id
    });
  });

  socket.on("typing", (isTyping) => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) return;

    socket.to(roomCode).emit("typing", {
      name: socket.data.chatName || "Friend",
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    const name = socket.data.chatName;

    if (!roomCode || !name) return;

    socket.to(roomCode).emit(
      "system-message",
      `${name} left the chat.`
    );

    io.to(roomCode).emit(
      "room-count",
      getRoomCount(roomCode)
    );
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Two Friends Chat is running on port ${PORT}`);
});
