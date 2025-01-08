import React, { useState, useEffect } from "react";
import "../reg_login/chatWindow.css";
import {
  sendMessageToBackend,
  fetchMessagesFromBackend,
} from "../MessageAPI/messageAPI";

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]); // Initialize messages as an empty array
  const [newMessage, setNewMessage] = useState(""); // Store the current message being typed

  // Function to fetch messages when the component mounts or when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        try {
          const messageData = {
            sender_id: currentUser._id,
            receiver_id: selectedUser._id,
          };

          const fetchedMessages = await fetchMessagesFromBackend(messageData);
          console.log("Fetched messages from backend:", fetchedMessages);

          // Process the messages to include time and sort them by time
          const messagesWithTime = fetchedMessages.map((message) => ({
            sender_id: message.senderid, // Use senderid from the backend
            receiver_id: message.receiverid, // Use receiverid from the backend
            text: message.actualmessage, // Map actualmessage from the backend to text
            time: new Date(message.createdat).toISOString(), // Ensure time is a valid ISO string
          }));

          // Sort messages by time
          messagesWithTime.sort((a, b) => new Date(a.time) - new Date(b.time));
          console.log("Sorted messages:", messagesWithTime);

          // Set the sorted messages
          setMessages(messagesWithTime || []);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim()) {
      const timestamp = new Date().toISOString(); // Ensure it's an ISO string
      const messageData = {
        sender_id: currentUser._id,
        receiver_id: selectedUser._id,
        time: timestamp, // Ensure valid timestamp
        text: newMessage,
      };
      try {
        await sendMessageToBackend(messageData); // Save message to the backend

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...messageData,
            sender_id: currentUser._id, // Add sender ID for proper rendering
          },
        ]);

        setNewMessage(""); // Clear input field
      } catch (error) {
        console.error("Error sending message:", error);
      }
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
              className={`message ${
                message.sender_id === currentUser._id ? "sent" : "received"
              }`}
            >
              <span className="message-sender">
                {message.sender_id === currentUser._id
                  ? "You"
                  : selectedUser.first_name}
                :
              </span>
              <span className="message-text">{message.text}</span>
              <span className="message-timestamp">
                {new Date(message.time).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-messages">
            No messages yet. Start the conversation!
          </p>
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
