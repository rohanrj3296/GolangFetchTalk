import React, { useEffect, useState } from "react";
import "../reg_login/chatInterface.css"; // Link to the CSS file
import { getUserEmail } from "../utils/token";
import ChatWindow from "../reg_login/chatWindow"; // Import the new ChatWindow component
import ProfileModal from "../reg_login/profileModal"; // Import ProfileModal

const ChatInterface = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showProfileModal, setShowProfileModal] = useState(false); // State for profile modal

  useEffect(() => {
    const fetchData = async () => {
      const userEmail = getUserEmail();

      try {
        const usersResponse = await fetch("http://localhost:8080/chat");
        if (!usersResponse.ok) {
          throw new Error(`Error fetching users: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();

        const loggedInUser = usersData.find((user) => user.email === userEmail);
        setCurrentUser(loggedInUser);

        const filteredUsers = usersData.filter(
          (user) => user.email !== userEmail
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error during data fetching:", error);
      }
    };

    fetchData();
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className={`chat-interface ${theme}`}>
      <nav className="navbar">
        <div className="navbar-brand">FetchTalk</div>
        <div className="navbar-links">
          <button onClick={() => setShowProfileModal(true)}>Profile</button>
          <button>Logout</button>
          <button onClick={() => setShowSettings(!showSettings)}>Theme</button>
          {currentUser && (
            <div className="user-profile-display">
              <img
                src={`https://via.placeholder.com/50?text=${
                  currentUser.first_name?.charAt(0) || "U"
                }${currentUser.last_name?.charAt(0) || ""}`}
                alt={`${currentUser.first_name || "User"} ${
                  currentUser.last_name || ""
                }`}
                className="profile-picture"
              />
              <div className="profile-info">
                {`${currentUser.first_name || "User"} ${
                  currentUser.last_name || ""
                }`}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="sidebar">
          <h2>Contacts</h2>
          <ul>
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => setSelectedConversation(user)}
                className={
                  selectedConversation?._id === user._id ? "active" : ""
                }
                data-user-id={user._id}
              >
                <img
                  src={`https://via.placeholder.com/50?text=${
                    user.first_name?.charAt(0) || "U"
                  }${user.last_name?.charAt(0) || ""}`}
                  alt={`${user.first_name || "Unknown"} ${
                    user.last_name || ""
                  }`}
                />
                <div className="contact-info">
                  <div className="name">
                    {`${user.first_name || "Unknown"} ${user.last_name || ""}`}
                  </div>
                  <div className="status">Online</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          {selectedConversation ? (
            <ChatWindow
              selectedUser={selectedConversation}
              currentUser={currentUser}
            />
          ) : (
            <div className="no-chat-selected">
              <h2>No chat selected</h2>
              <p>Please select a conversation to view details.</p>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="settings">
          <div className="settings-header">
            <h2>Theme</h2>
            <button
              className="close-btn"
              onClick={() => setShowSettings(false)}
            >
              &times;
            </button>
          </div>
          <div className="theme-options">
            <button onClick={() => handleThemeChange("light")}>Light</button>
            <button onClick={() => handleThemeChange("dark")}>Dark</button>
            <button onClick={() => handleThemeChange("olive-green")}>
              Olive-Green
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
