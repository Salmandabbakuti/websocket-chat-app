// if url is not specified, it will connect to the same host and port as the current page
const socket = io();
// create new user and emit event
const userName = prompt("Enter your name to join...") || `User${Math.floor(Math.random() * 1000)}`;
document.getElementById("username").innerHTML = userName;
socket.emit("user-joined", userName);

const messageInputBox = document.querySelector(".message-input");
const sendMessageButton = document.querySelector(".send-message-btn");
const feedbackDiv = document.querySelector("#feedback");
const messagesDiv = document.querySelector("#messages");
const activeUsersDiv = document.querySelector("#active-users");

let activeUsers = [];

const renderActiveUsers = (activeUsers) => {
  activeUsersDiv.innerHTML = "";
  activeUsers.forEach((user) => {
    if (user.name === userName) activeUsersDiv.innerHTML += `<p>&#128994;You</p>`;
    else activeUsersDiv.innerHTML += `<p>&#128994;${user.name}</p>`;
  });
};

const sendMessage = (message) => {
  if (!message) return;
  socket.emit("send-message", { message, timestamp: Date.now() });
  messagesDiv.innerHTML += `<p id="myMessage"><strong>You</strong></br>${message}</br><small>${new Date().toLocaleTimeString()}</small></p>`;
  messageInputBox.value = "";
  socket.emit("typing", { name: userName, isTyping: false });
};

socket.on("user-joined", (data) => {
  console.log(data.activeUsers);
  console.log(`${data.newUser.name} joined the chat`);
  feedbackDiv.innerHTML = `${data.newUser.name} joined the chat`;
  // Set all active users
  activeUsers = data.activeUsers;
  renderActiveUsers(data.activeUsers);
});

socket.on("new-message", (data) => {
  console.log(`${data.name}: ${data.message}`);
  messagesDiv.innerHTML += `<p><strong>${data.name}</br></strong>${data.message}</br><small>${new Date(data.timestamp).toLocaleTimeString()}</small></p>`;
});

socket.on("user-left", (name) => {
  console.log(`${name} left the chat`);
  feedbackDiv.innerHTML = `${name} left the chat`;
  activeUsers = activeUsers.filter((user) => user.name !== name);
  renderActiveUsers(activeUsers);
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
    sendMessage(message);
  }
  socket.emit("typing", {
    name: userName,
    isTyping: messageInputBox.value.length > 0
  });
});

// send message to server on click of send button
sendMessageButton.addEventListener("click", () => {
  const message = messageInputBox.value;
  sendMessage(message);
});
