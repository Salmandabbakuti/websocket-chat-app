const socket = io(); // if url is not specified, it will connect to the same host and port as the current page
// create new user and emit event
const userName = prompt("Enter your name to join...");
document.getElementById("username").innerHTML = userName;
socket.emit("user-joined", userName);

const messageInputBox = document.querySelector(".message-input");
const sendMessageButton = document.querySelector(".send-message-btn");
const feedbackDiv = document.querySelector("#feedback");
const messagesDiv = document.querySelector("#messages");

socket.on("user-joined", (data) => {
  console.log(data);
  console.log(`${data.newUser.name} joined the chat`);
  feedbackDiv.innerHTML = `${data.newUser.name} joined the chat`;
});
socket.on("new-message", (data) => {
  console.log(`${data.name}: ${data.message}`);
  // with timestamp in small font below the message
  messagesDiv.innerHTML += `<p><strong>${data.name}: </strong>${data.message}</br><small>${new Date(data.timestamp).toLocaleTimeString()}</small></p>`;
});
socket.on("user-left", (name) => {
  feedbackDiv.innerHTML = `${name} left the chat`;
});

socket.on("typing", ({ name, isTyping }) => {
  console.log(`${name} is typing...`);
  feedbackDiv.innerHTML = isTyping ? `${name} is typing...` : "";
});

// check if user is typing
messageInputBox.addEventListener("keyup", (event) => {
  // if enter key is pressed, send message
  if (event.keyCode === 13) {
    const message = messageInputBox.value;
    socket.emit("send-message", message);
    messagesDiv.innerHTML += `<p id="myMessages"><strong>${userName}: </strong>${message}</br><small>${new Date().toLocaleTimeString()}</small></p>`;
    messageInputBox.value = "";
    socket.emit("typing", { name: userName, isTyping: false });
  }
  socket.emit("typing", {
    name: userName,
    isTyping: messageInputBox.value.length > 0
  });
});

// send message to server on click of send button
sendMessageButton.addEventListener("click", () => {
  const message = messageInputBox.value;
  socket.emit("send-message", message);
  messagesDiv.innerHTML += `<p id="myMessages"><strong>${userName}: </strong>${message}</br><small>${new Date().toLocaleTimeString()}</small></p>`;
  messageInputBox.value = "";
  socket.emit("typing", { name: userName, isTyping: false });
});

// show active users in the chat room
socket.on("active-users", (users) => {
  console.log(users);
});
