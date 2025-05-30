// Input from users
const user_input = document.querySelector(".message-input");

// Gemini API key and URL
const API_KEY = "AIzaSyCcSJ7MqOeYnzc2D9pBr0kVSwpDhz6izwA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Function to show user's message in the chat
function createbox(user_msg) {
    // Create a box for user's message
    const userBox = document.createElement("div");
    userBox.classList.add("msg-txt");    // *******copies css of "msg-text"
    userBox.innerText = user_msg;

    // Add it inside a container with a specific ID
    const userContainer = document.createElement("div");
    userContainer.id = "msg-user";
    userContainer.appendChild(userBox);

    // Add the message to the chat window and scroll to bottom
    document.getElementById("chat-body").appendChild(userContainer);

    //************the #chat-body element all the way to the bottom — to the full height of its scrollable content.
    document.getElementById("chat-body").scrollTop = document.getElementById("chat-body").scrollHeight;
}

// Function to show the bot's reply in the chat
function appendBotResponse(bot_msg) {
    const botBox = document.createElement("div");
    botBox.classList.add("msg-txt");
    botBox.innerText = bot_msg;

    const botContainer = document.createElement("div");
    botContainer.id = "msg-chatbot";
    botContainer.appendChild(botBox);

    document.getElementById("chat-body").appendChild(botContainer);
    document.getElementById("chat-body").scrollTop = document.getElementById("chat-body").scrollHeight;
}

// Function to show a loading animation (dots) while waiting for bot response
function showLoading() {
    const loadingContainer = document.createElement("div");
    loadingContainer.id = "msg-chatbot";
    loadingContainer.classList.add("loading-container");

    const loading = document.createElement("div");
    loading.classList.add("loading");
    loading.style.visibility = "visible";

    // Create 3 animated dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.createElement("div");
        dot.id = `c${i}`;
        loading.appendChild(dot);
    }

    loadingContainer.appendChild(loading);
    document.getElementById("chat-body").appendChild(loadingContainer);
    document.getElementById("chat-body").scrollTop = document.getElementById("chat-body").scrollHeight;

    return loadingContainer; // Return the loading element so we can remove it later
}

let chatHistory = [];       //********************* store past conversations/Context


// Function to call the Gemini API and get a chatbot response
const chatbot_response = async (user_msg) => {
    const loadingElement = showLoading();

    // ******** To understand the context of past. every time that model takes this array as input
    chatHistory.push({
        role: "user",    //*******gemini 2.0 wants to know who sent the data
        parts: [{ text: user_msg }]
    });

    const req_options = {
        method: "POST",   // ********we are sending data so we use POST
        headers: {
            "Content-Type": "application/json"   // *****telling the server that i am sending data in json format
        },
        body: JSON.stringify({
            contents: chatHistory
        })
    };

    try {
        const resp = await fetch(API_URL, req_options);   
        const data = await resp.json();    // *****convert promise to json format

        loadingElement.remove();

        if (resp.ok == false) throw new Error(data.error.message);

        // ? is to check whther candidates exists. if exist move ahead or else "No response from bot."
        const botReply = data.candidates?.[0].content?.parts?.[0]?.text || "No response from bot.";

        // Append bot's reply to chat history
        chatHistory.push({
            role: "model",             // ****role is model because it is a bots,reply
            parts: [{ text: botReply }]
        });

        appendBotResponse(botReply);
    } catch (error) {
        loadingElement.remove();
        console.error("API Error:", error.message);
        appendBotResponse("Something went wrong");
    }
};

 // main function to to read and respond to the user's request

user_input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { // Only run when Enter is pressed (without Shift)

        e.preventDefault(); // *********Stop the default newline behavior by pressing Enter

        const user_msg = user_input.value.trim(); // Get the message and remove extra spaces(.trim())
        if (user_msg !== "") {
            createbox(user_msg); 

            user_input.value = ""; // *Clear the input box
            chatbot_response(user_msg); // Send message to chatbot
        }
    }
});

document.getElementById("send").addEventListener("click", () => {
    
        
        const user_msg = user_input.value.trim(); // Get the message and remove extra spaces(.trim())
        if (user_msg !== "") {
            createbox(user_msg); 

            user_input.value = ""; // *Clear the input box
            chatbot_response(user_msg); // Send message to chatbot
        }
    
});

document.getElementById("close").addEventListener("click",()=>{
     window.location.href = "chat.html";
})





