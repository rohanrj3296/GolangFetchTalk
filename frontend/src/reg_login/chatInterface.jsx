import React, { useEffect, useState } from "react";
import "../reg_login/chatInterface.css"; // Link to the CSS file
import { getUserEmail } from "../utils/token";
import ChatWindow from "../reg_login/chatWindow"; // Import the new ChatWindow component

const ChatInterface = () => {
  const [users, setUsers] = useState([]); // State to store the fetched users
  const [currentUser, setCurrentUser] = useState(null); // State to store logged-in user's details
  const [selectedConversation, setSelectedConversation] = useState(null); // Tracks the selected conversation
  const [showSettings, setShowSettings] = useState(false); // Tracks settings display state
  const [theme, setTheme] = useState("light"); // Tracks the current theme

  useEffect(() => {
    const fetchData = async () => {
      const userEmail = getUserEmail(); // Get logged-in user's email

      try {
        // Step 1: Fetch all users
        const usersResponse = await fetch("http://localhost:8080/chat");
        if (!usersResponse.ok) {
          throw new Error(`Error fetching users: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();

        // Step 2: Find the current user's details
        const loggedInUser = usersData.find((user) => user.email === userEmail);
        setCurrentUser(loggedInUser);

        // Step 3: Filter out the logged-in user from the list
        const filteredUsers = usersData.filter(
          (user) => user.email !== userEmail
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error during data fetching:", error);
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array ensures it runs once on component mount

  // Function to change the theme
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme); // Apply theme to the entire app
  };

  return (
    <div className={`chat-interface ${theme}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">FetchTalk</div>
        <div className="navbar-links">
          <button>Profile</button>
          <button>Logout</button>
          <button onClick={() => setShowSettings(!showSettings)}>Theme</button>
          {/* Display the user's full name */}
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
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="main-content">
          {selectedConversation ? (
            <ChatWindow selectedUser={selectedConversation}
            currentUser={currentUser} />
          ) : (
            <div className="no-chat-selected">
              <h2>No chat selected</h2>
              <p>Please select a conversation to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
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
    </div>
  );
};

export default ChatInterface;
