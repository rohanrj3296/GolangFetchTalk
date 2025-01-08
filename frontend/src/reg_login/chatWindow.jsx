import React, { useState, useEffect, useRef } from "react";
import "../reg_login/chatWindow.css";
import {
  sendMessageToBackend,
  fetchMessagesFromBackend,
} from "../MessageAPI/messageAPI";

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]); // Initialize messages as an empty array
  const [newMessage, setNewMessage] = useState(""); // Store the current message being typed
  const chatEndRef = useRef(null); // To scroll to the bottom of the chat window

  // Function to fetch messages
  const fetchMessages = async () => {
    if (selectedUser && currentUser) {
      try {
        const messageData = {
          sender_id: currentUser._id,
          receiver_id: selectedUser._id,
        };

        const fetchedMessages = await fetchMessagesFromBackend(messageData);

        // Process the messages to include time
        const messagesWithTime = fetchedMessages.map((message) => ({
          sender_id: message.senderid, // Use senderid from the backend
          receiver_id: message.receiverid, // Use receiverid from the backend
          text: message.actualmessage, // Map actualmessage from the backend to text
          time: new Date(message.createdat).toISOString(), // Ensure time is a valid ISO string
        }));

        // Sort messages by time
        messagesWithTime.sort((a, b) => new Date(a.time) - new Date(b.time));

        // Merge new messages with existing ones (avoid duplicates)
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg.time));
          const newMessages = messagesWithTime.filter(
            (msg) => !existingIds.has(msg.time)
          );
          return [...prevMessages, ...newMessages];
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchMessages(); // Fetch messages initially
      scrollToBottom();

      const interval = setInterval(() => {
        fetchMessages();
      }, 1000); // Poll every 2 seconds

      return () => clearInterval(interval); // Clean up interval on unmount
    }
  }, [selectedUser, currentUser]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

        // Add the new message directly to the state if it doesn't already exist
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg.time));
          if (!existingIds.has(timestamp)) {
            return [...prevMessages, messageData];
          }
          return prevMessages;
        });

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
        <div ref={chatEndRef} /> {/* Reference to scroll to the bottom */}
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
