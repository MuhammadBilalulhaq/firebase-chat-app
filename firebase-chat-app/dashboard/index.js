import { db } from "../firebase.config.js";
import {
  set,
  push,
  ref,
  onChildAdded,
  remove,
  onChildRemoved,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const userNameInput = document.getElementById("username");
const messageRef = ref(db, "messages");

let userToChat;

const sendMessage = async (e) => {
  e.preventDefault();
  const userMessage = messageInput.value;
  const userName = userNameInput.value;
  try {
    await push(messageRef, {
      message: userMessage,
      name: userName,
    });
  } catch (err) {
    console.log(err, "err message");
  }
};

window.deleteMessage = function (messageKey) {
  remove(ref(db, "messages/" + messageKey));
  console.log(messageKey);
};

onChildAdded(messageRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
  chatBox.innerHTML += `<div class='user-message' id='${snapshot.key}'>
        <div>
        <strong>${data.name}:</strong>${data.message}
        </div>
        <button onclick="deleteMessage('${snapshot.key}')">Delete</button>
    </div>`;

  chatBox.scrollTop = chatBox.scrollHeight;
});

onChildRemoved(messageRef, (snapshot) => {
  const parent = document.getElementById("chat-box");
  const child = document.getElementById(snapshot.key);
  // Remove the child from the parent
  if (parent && child) {
    parent.removeChild(child);
  }
});

window.startChat = (user) => {
  const chatWindow = document.getElementById('chat-window');
  const recipientName = document.getElementById("recipient-name");
  const chatUser = JSON.parse(user);
  
  userToChat = chatUser;

  console.log(chatUser);
  recipientName.innerHTML = `<h1>${chatUser.username}</h1>`;
};

const loadUsers = () => {
  const usersContainer = document.getElementById("users-container");

  get(ref(db, "users"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((record) => {
          const user = record.val();
          usersContainer.innerHTML += `
          <li class="list-group-item list-group-item-action" onclick="startChat('${JSON.stringify(user).replace(/"/g, "&quot;")}')">${user.username}</li>`;
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

loadUsers();
chatForm.addEventListener("submit", sendMessage);
