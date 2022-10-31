const socket = io("http://localhost:4000");
// create new user and emit event
const newUser = prompt("Enter your name to join");
document.getElementById("username").innerHTML = newUser;
socket.emit("user-joined", newUser);

const messageInputBox = document.querySelector(".message-input");
const sendMessageButton = document.querySelector(".send-message-btn");

socket.on("user-joined", (name) => {
  console.log(`${name} joined the chat`);
});
socket.on("new-message", (data) => {
  console.log(`${data.name}: ${data.message}`);
});
socket.on("user-left", (name) => {
  console.log(`${name} left the chat`);
});
socket.on("typing", (name) => {
  console.log(`${name} is typing...`);
});

// check if user is typing
messageInputBox.addEventListener("keyup", () => {
  socket.emit("typing", {
    name: newUser,
    isTyping: messageInputBox.value.length > 0,
  });
});

// send message to server
sendMessageButton.addEventListener("click", () => {
  const message = messageInputBox.value;
  socket.emit("send-message", message);
  messageInputBox.value = "";
});


