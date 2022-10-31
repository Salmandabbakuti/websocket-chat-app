const express = require("express");
const http = require("http");
const path = require("path");
const socket = require("socket.io");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const server = app.listen(4000, () =>
  console.log(`Server started on http://localhost:4000`)
);
const io = socket(server);

const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for new user
  socket.on("user-joined", (name) => {
    console.log("User joined:", name);
    activeUsers.set(socket.id, name);
    socket.broadcast.emit("user-joined", name);
  });

  // Listen for user disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", activeUsers.get(socket.id));
    activeUsers.delete(socket.id);
  });

  // Listen for new message
  socket.on("send-message", (message) => {
    socket.broadcast.emit("new-message", {
      message: message,
      name: activeUsers.get(socket.id),
      timestamp: Date.now()
    });
  });

  // Listen for typing
  socket.on("typing", (data) => {
    console.log("Typing:", data.isTyping, data.name);
    socket.broadcast.emit("typing", data.name);
  });
});

io.on("disconnect", () => console.log("Client disconnected"));
