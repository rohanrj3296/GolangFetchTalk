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

        console.log("Fetched messages from backend:", fetchedMessages);

        // Process the messages to include time
        const messagesWithTime = fetchedMessages.map((message) => ({
          sender_id: message.senderid, // Use senderid from the backend
          receiver_id: message.receiverid, // Use receiverid from the backend
          text: message.actualmessage, // Map actualmessage from the backend to text
          time: new Date(message.createdat).toISOString(), // Ensure time is a valid ISO string
        }));

        console.log("Processed messages with time:", messagesWithTime);

        // Sort messages by time
        messagesWithTime.sort((a, b) => new Date(a.time) - new Date(b.time));
        console.log("Sorted messages by time:", messagesWithTime);

        setMessages((prevMessages) => {
          const latestTime = prevMessages.length > 0 ? new Date(prevMessages[prevMessages.length - 1].time).getTime() : 0;
  
          const newMessages = messagesWithTime.filter((msg) => new Date(msg.time).getTime() > latestTime);
  
          console.log("New messages to append:", newMessages);
  
          return [...prevMessages, ...newMessages];
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to bottom of chat window.");
    }
  };

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    if (selectedUser && currentUser) {
      console.log("Chat window opened for user:", selectedUser.first_name);
      fetchMessages(); // Fetch messages initially
      scrollToBottom();

      const interval = setInterval(() => {
        console.log("Polling for new messages...");
        fetchMessages();
      }, 1000); // Poll every 1 second

      return () => {
        clearInterval(interval); // Clean up interval on unmount
        console.log("Chat window closed, polling stopped.");
      };
    }
  }, [selectedUser, currentUser]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
    console.log("Messages updated:", messages);
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

        console.log("Message sent to backend:", messageData);

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
              key={message.time} // Use unique timestamp as key
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
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;