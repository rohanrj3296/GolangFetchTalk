import React, { useState, useEffect, useRef } from "react";
import "../reg_login/chatWindow.css";
import {
  sendMessageToBackend,
  fetchMessagesFromBackend,
} from "../MessageAPI/messageAPI";
import galleryIcon from '../reg_login/gallery.png';

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]); // Initialize messages as an empty array
  const [newMessage, setNewMessage] = useState(""); // Store the current message being typed
  const [viewedPicture, setViewedPicture] = useState(null); // State for viewed picture
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

        setMessages((prevMessages) => {
          const latestTime =
            prevMessages.length > 0
              ? new Date(prevMessages[prevMessages.length - 1].time).getTime()
              : 0;

          const newMessages = messagesWithTime.filter(
            (msg) => new Date(msg.time).getTime() > latestTime
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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchMessages(); // Fetch messages initially
      scrollToBottom();

      const interval = setInterval(() => {
        fetchMessages();
      }, 1000); // Poll every 1 second

      return () => {
        clearInterval(interval); // Clean up interval on unmount
      };
    }
  }, [selectedUser, currentUser]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim()) {
      const timestamp = new Date().toISOString();
      const messageData = {
        sender_id: currentUser._id,
        receiver_id: selectedUser._id,
        time: timestamp,
        text: newMessage,
      };
      try {
        await sendMessageToBackend(messageData);
        setNewMessage(""); // Clear input field
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Function to handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const timestamp = new Date().toISOString();
        const messageData = {
          sender_id: currentUser._id,
          receiver_id: selectedUser._id,
          time: timestamp,
          text: base64Image, // Send the image as a message
        };
        try {
          await sendMessageToBackend(messageData);
        } catch (error) {
          console.error("Error sending image:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if a message is a base64 image
  const isBase64Image = (text) => {
    return /^data:image\/(png|jpg|jpeg);base64,/.test(text);
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
              key={message.time}
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
              {isBase64Image(message.text) ? (
                <a
                  href={message.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    setViewedPicture(message.text);
                  }}
                >
                  <img
                    src={message.text}
                    alt="Sent Image"
                    className="message-image"
                  />
                </a>
              ) : (
                <span className="message-text">{message.text}</span>
              )}

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
        <div ref={chatEndRef} />
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
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="image-upload"
          onChange={handleImageUpload}
        />
        
<label htmlFor="image-upload" className="upload-button">
<img
  src={galleryIcon}
  alt="Upload"
  style={{ width: "24px", height: "24px", cursor: "pointer" }}
/>
</label>
      </div>

      {viewedPicture && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "14cm",
              height: "14cm",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={viewedPicture}
              alt="Viewed"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setViewedPicture(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
