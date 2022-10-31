const express = require("express");
const path = require("path");
const socket = require("socket.io");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const server = app.listen(process.env.PORT || 4000, () =>
  console.log(`Server started on http://localhost:${process.env.PORT || 4000}`)
);
const io = socket(server);

const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for new user
  socket.on("user-joined", (name) => {
    console.log("User joined:", name);
    activeUsers.set(socket.id, name);
    socket.broadcast.emit("user-joined", {
      newUser: { id: socket.id, name },
      // convert map to array of objects
      activeUsers: [...activeUsers.entries()].map(([id, name]) => ({
        id,
        name
      }))
    });
  });

  // Listen for user disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", activeUsers.get(socket.id));
    activeUsers.delete(socket.id);
  });

  // Listen for new message
  socket.on("send-message", ({ message, timestamp }) => {
    socket.broadcast.emit("new-message", {
      message,
      name: activeUsers.get(socket.id),
      timestamp
    });
  });

  // Listen for typing
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});

io.on("disconnect", () => console.log("Client disconnected"));
