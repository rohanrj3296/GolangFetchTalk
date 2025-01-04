import React, { useState } from "react";
import "../reg_login/chatWindow.css"

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]); // To store chat messages
  const [newMessage, setNewMessage] = useState(""); // To store the current message being typed

  // Function to send a new message
  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, sender: "You", timestamp: new Date().toLocaleTimeString() },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{`${selectedUser.first_name} ${selectedUser.last_name}`}</h2>
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "You" ? "sent" : "received"}`}
            >
              <span className="message-sender">{message.sender}:</span>
              <span className="message-text">{message.text}</span>
              <span className="message-timestamp">{message.timestamp}</span>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
