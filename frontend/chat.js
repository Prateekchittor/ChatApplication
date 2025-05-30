

const API = "https://chatapplication-kptr.onrender.com";
let selectedUserId = null;
let authUser = null;
let chatHistory = [];

// Connect to Socket.IO
const socket = io("https://chatapplication-kptr.onrender.com", {
  withCredentials: true
});

// Gemini API config

const API_KEY = "AIzaSyCcSJ7MqOeYnzc2D9pBr0kVSwpDhz6izwA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;



// on reload
window.onload = async () => {


  document.getElementById("loading").style.display = "block";

  const authRes = await fetch(`${API}/api/auth/check`, {
    credentials: "include",
  });


  document.getElementById("loading").style.display = "none";
  
  if (!authRes.ok) {

    window.location.href = "index.html";
    return;
  }

  authUser = await authRes.json();


  
  
  
  loadUsers();

 



};





// Load sidebar users
async function loadUsers() {

    document.getElementById("loading").style.display = "block";
  const res = await fetch(`${API}/api/message/users`, {
    credentials: "include",
  });


  const users = await res.json();

 document.getElementById("loading").style.display = "none";
  
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  users.forEach(user => {
    const ele = document.createElement("div");
    ele.textContent = user.Name;

    ele.style.fontWeight = "bolder";
    ele.style.height = "50px";
    ele.style.border = "2px solid white";
    ele.style.cursor = "pointer";
    ele.style.borderRadius = "20px";
    ele.style.textAlign = "center";
    ele.style.margin = "15px";
    ele.style.fontSize = "22px";
    ele.style.backgroundColor = "rgb(179, 255, 231)";

   

   
    ele.addEventListener('mouseover', () => {

      ele.style.background = "linear-gradient(120deg, #b8e8ff, #649bf3, #2ea4ff)";
      
    });

    ele.addEventListener('mouseout', () => {
      
      ele.style.background = "";
      ele.style.backgroundColor = "rgb(179, 255, 231)";
    
      });


    
    ele.onclick = () => {
      


      selectedUserId = user._id;
      document.getElementById("chat-box").style.visibility = "visible";
      fetchMessages(user.Name);
     };

    userList.appendChild(ele);
  });
}





//////////////   side functions
function scrollToBottom() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}







let history = [];

async function fetchMessages(selectedUserName) {
  document.getElementById("username").textContent = selectedUserName;


  if(selectedUserId ==null)
  { 
    console.log("selectuser is invalid");
     return;
  }

   document.getElementById("loading").style.display = "block";


  const res = await fetch(`${API}/api/message/${selectedUserId}`, {
    method: "GET",
    credentials: "include",
  });

  const messages = await res.json();


  document.getElementById("loading").style.display = "none";

  
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";



  history=[];

  messages.forEach(msg => {



    const currentTime = new Date();

    if (new Date(msg.Timestamp) <= currentTime) {
      const messageBubble = document.createElement("div");
      const isSentByMe = msg.SenderId === authUser._id;

      
    
      // Create the message text
      const line = isSentByMe
        ? `You: ${msg.Text}`
        : `${selectedUserName}: ${msg.Text}`;
    
      history.push(line);
    
      // Convert timestamp to a readable date format
      let timestamp = "";
      if (msg.Timestamp) {
        const messageDate = new Date(msg.Timestamp);
        timestamp = messageDate.toLocaleString(); // Customize as needed
      }
    
      // Set styles for messageBubble (parent container)
      messageBubble.style.position = "relative"; // For absolute positioning of delete button
      messageBubble.style.padding = "10px";
      messageBubble.style.margin = "10px 0";
      
      messageBubble.style.borderRadius = "6px";

      messageBubble.style.border ="2px black solid";
    
      // Display the message
      messageBubble.textContent = line;
    
      // Create and style delete button
      const delbtn = document.createElement("button");
      delbtn.classList.add("material-symbols-outlined");
      delbtn.textContent = "delete";
    
      delbtn.style.position = "absolute";
      delbtn.style.top = "5px";

      delbtn.style.right = "15px";
      delbtn.style.height = "30px";
      delbtn.style.width = "30px";

      delbtn.style.fontSize = "24px";

      delbtn.style.border = "none";
      delbtn.style.borderRadius = "4px";

      

      delbtn.style.cursor = "pointer";
      delbtn.style.background = "transparent"; // Optional: transparent background
      delbtn.style.color = "#888"; // Optional: grey icon color
      delbtn.title = "Delete this message"; // Tooltip on hover
    
      // Append delete button to the message bubble
      messageBubble.appendChild(delbtn); // ✅ Only once
    
      // Add timestamp if available
      if (timestamp) {
        const timestampDiv = document.createElement("div");
        timestampDiv.textContent = timestamp;
        timestampDiv.className = "message-timestamp";
        timestampDiv.style.color = "grey";
        timestampDiv.style.fontSize = "smaller";
        timestampDiv.style.textAlign = "left";
        timestampDiv.style.marginTop = "5px";
    
        messageBubble.appendChild(timestampDiv);
      }
    

     




    
      // Add styling for incoming/outgoing messages
      messageBubble.className = `message ${isSentByMe ? "outgoing" : "incoming"}`;
      
      // Append the message to the messages container

      messageBubble.setAttribute("data-id", msg._id);  //add this when rendering messages



      messagesDiv.appendChild(messageBubble);
    }
    
  });


  







  // **Gemini API: suggest reply based on last 5 messages**
  let prevmsg = "";
  for (let i = history.length - 1; i >= 0 && i > history.length - 5; i--) {
    prevmsg = history[i] + prevmsg;
  }

  prevmsg += "Just give the reply I should give back from my perspective based on last reply from them. I don't want possible replies. Just select a single reply from my perspective. Don't give 'You:' text.";

  chatHistory.push({
    role: "user",
    parts: [{ text: prevmsg }]
  });

  const req_options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contents: chatHistory })
  };

  try {

    document.getElementById("loading").style.display = "block";
    
    const resp = await fetch(API_URL, req_options);
    const data = await resp.json();


    document.getElementById("loading").style.display = "none";

    if (!resp.ok) throw new Error(data.error.message);

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from bot.";

    chatHistory.push({
      role: "model",
      parts: [{ text: botReply }]
    });

    document.getElementById("botreply").textContent = botReply;
  } catch (error) {
    console.error("Chat bot API Error:", error.message);
  }

  scrollToBottom();

  deletemsg();
}


async function botMessage() {
  const input = document.getElementById("botreply");
  const text = input?.innerText?.trim();

  if (!text || !selectedUserId) return;

  try {

    if(selectedUserId ==null)
      { 
        console.log("selectuser is invalid");
         return;
      }


    document.getElementById("loading").style.display = "block";
    
    const res = await fetch(`${API}/api/message/send/${selectedUserId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });


    document.getElementById("loading").style.display = "none";

    if (res.ok) {
      
      // Emit the bot message via Socket.IO
      socket.emit("sendMessage", {
        senderId: authUser._id,
        receiverId: selectedUserId,
        message: text,
       
      });

      const selectedUserName = document.getElementById("username")?.textContent?.trim();
      if (selectedUserName) {
        fetchMessages(selectedUserName);
      }
    } else {
      console.error("Failed to send bot message:", res.status);
    }
  } catch (error) {
    console.error("Error sending bot message:", error);
  }
}


async function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();

  if (!text || !selectedUserId) return;


  if(selectedUserId ==null)
    { 
      console.log("selectuser is invalid");
       return;
    }

document.getElementById("loading").style.display = "block";
  
  const res = await fetch(`${API}/api/message/send/${selectedUserId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  document.getElementById("loading").style.display = "none";

  if (res.ok) {
    input.value = "";

    // Emit the message via Socket.IO for real-time delivery
    socket.emit("sendMessage", {
      senderId: authUser._id,
      receiverId: selectedUserId,
      message: text,
    
    });

    const selectedUserName = document.getElementById("username").textContent;
    fetchMessages(selectedUserName);
  }
}



/// shcedule meeting


async function schedulemsg() {
  const myId = authUser._id;
  const input = document.getElementById("schtext");    
  const input2 = document.getElementById("schtime").value;

  // Convert input string to Date object
  const dateObject2 = new Date(input2);

  // Get the ISO string representation of the Date object (UTC time)
  const isoString = dateObject2.toISOString();
  console.log(isoString);  // Logs in the format "2025-04-22T17:37:21.811Z"

  // If you want to convert to a format like "2025-04-22T17:37:21.811+00:00" (with the +00:00 offset for UTC):
  const formattedString = isoString.replace("Z", "+00:00");

  const text = input.value.trim();

  if (!text || !selectedUserId) return;  // Ensure all fields are filled

  // Convert the formatted string back to Date object for validation and comparison
  const dateObject = new Date(formattedString); // Use this Date object for comparison

  // Ensure the date is valid
  if (isNaN(dateObject.getTime())) {
      console.error("Invalid schedule time.");
      return;
  }

  if(selectedUserId ==null)
    { 
      console.log("selectuser is invalid");
       return;
    }

  document.getElementById("loading").style.display = "block";

  const res = await fetch(`${API}/api/message/schedulemsg/${selectedUserId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ myId, text, Timestamp: dateObject }),  // Send Date object instead of string
  });

document.getElementById("loading").style.display = "none";
  
  if (res.ok) {
      input.value = "";
      input2.value = "";

      // Optionally emit if scheduled time is "now" or immediate
      const isImmediate = dateObject.getTime() <= Date.now() + 1000;

      if (isImmediate) {
          socket.emit("sendMessage", {
              senderId: authUser._id,
              receiverId: selectedUserId,
              message: text,
          });
      }

      const selectedUserName = document.getElementById("username").textContent;
      fetchMessages(selectedUserName);
  } else {
      console.error("Failed to schedule message");
  }

  document.getElementById("readtime").style.display = "none";
}


function readtime() {
  document.getElementById("readtime").style.display ="block"
}

function cancel()
{ 
  document.getElementById("readtime").style.display = "none";
}















// Listen for incoming real-time messages
socket.on("receiveMessage", async({ senderId, message }) => {
  if (selectedUserId === senderId) {
    const messagesDiv = document.getElementById("messages");
    const messageBubble = document.createElement("div");
    messageBubble.textContent = `${document.getElementById("username").textContent}: ${message}`;
    messageBubble.className = "message incoming";



    




    history.push(message);

    messagesDiv.appendChild(messageBubble);








 /// bot *********************************************



 let prevmsg = "";
 for (let i = history.length - 1; i >= 0 && i > history.length - 5; i--) {
   prevmsg = history[i] + prevmsg;
 }

 prevmsg += "Just give the reply I should give back from my perspective based on last reply from them. I don't want possible replies. Just select a single reply from my perspective. Don't give 'You:' text.";

 chatHistory.push({
   role: "user",
   parts: [{ text: prevmsg }]
 });

 const req_options = {
   method: "POST",
   headers: {
     "Content-Type": "application/json"
   },
   body: JSON.stringify({ contents: chatHistory })
 };

 try {

document.getElementById("loading").style.display = "block";

   
   const resp = await fetch(API_URL, req_options);
   const data = await resp.json();


   document.getElementById("loading").style.display = "none";

   if (!resp.ok) throw new Error(data.error.message);

   const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from bot.";

   chatHistory.push({
     role: "model",
     parts: [{ text: botReply }]
   });

   document.getElementById("botreply").textContent = botReply;
 } catch (error) {
   console.error("Chat bot API Error:", error.message);
 }

 /// **************************




    
    scrollToBottom();
  }
});

async function logout() {

  document.getElementById("loading").style.display = "block";
  
  await fetch(`${API}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

document.getElementById("loading").style.display = "none";
  
  window.location.href = "index.html";
}




function deletemsg() {
  const messages = document.getElementById("messages").children;
  const myId = authUser._id;

  for (let i = 0; i < messages.length; i++) {
    const msgEl = messages[i];
    const delBtn = msgEl.querySelector("button.material-symbols-outlined");

    if (!delBtn) continue; // Skip if delete button not found

    delBtn.addEventListener("click", async (event) => {
      event.stopPropagation(); // Prevent bubbling to msgEl or other elements

      const _Id = msgEl.getAttribute("data-id");
      if (!_Id) return;

      if(selectedUserId ==null)
        { 
          console.log("selectuser is invalid");
           return;
        }

      document.getElementById("loading").style.display = "block";

      const res = await fetch(`${API}/api/message/deletemsg/${selectedUserId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myId, _Id }),
      });

      document.getElementById("loading").style.display = "none";

      if (res.ok) {
        console.log("Deleted successfully");
        msgEl.remove(); // Remove the element from DOM
      } else {
        console.error("Failed to delete");
      }
    });
  }
}
// --------------------------- ChatBot ------------------------------------------------


let chatbot = document.getElementById("chatbot");

chatbot.addEventListener("click",()=>{
  window.location.href = "chatbot_index.html";

});





