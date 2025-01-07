import React, { useState } from "react";
import "../reg_login/chatWindow.css";
import { sendMessageToBackend } from "../MessageAPI/messageAPI";

const ChatWindow = ({ selectedUser,currentUser }) => {
  const [messages, setMessages] = useState([]); // To store chat messages
  const [newMessage, setNewMessage] = useState(""); // To store the current message being typed

  // Function to send a new message
  const sendMessage = async() => {
    if (newMessage.trim()) {
      const timestamp = new Date().toISOString();
      const messageData = {
        sender_id:currentUser._id,
        receiver_id:selectedUser._id,
        time:timestamp,
        actual_message:newMessage,

      }
      console.log(messageData)
      try{
        await sendMessageToBackend(messageData);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: newMessage, sender: "You", timestamp: new Date().toLocaleTimeString() },
        ]);
        setNewMessage("");
        
      }catch(error){
        console.error("Failed To Send Message",error)

      };
      
      
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
