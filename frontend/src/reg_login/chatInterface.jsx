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
        // Fetch all users
        const usersResponse = await fetch("http://localhost:8080/chat");
        if (!usersResponse.ok) {
          throw new Error(`Error fetching users: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();

        // Identify the logged-in user
        const loggedInUser = usersData.find((user) => user.email === userEmail);
        setCurrentUser(loggedInUser);

        // Filter out the logged-in user and set other users
        const filteredUsers = usersData.filter(
          (user) => user.email !== userEmail
        );
        setUsers(filteredUsers);

        // Extract user IDs, including the current user's ID
        const userIds = [
          ...filteredUsers.map((user) => user._id),
          loggedInUser?._id,
        ].filter(Boolean);

        const requestBody = { userIds };
        console.log("Sending to backend:", JSON.stringify(requestBody));

        const profilePicsResponse = await fetch("http://localhost:8080/getallprofilepictures", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!profilePicsResponse.ok) {
          throw new Error(`Error fetching profile pictures: ${profilePicsResponse.status}`);
        }

        // Log the JSON response to inspect the data
        const profilePicsData = await profilePicsResponse.json();
        console.log("Profile Pictures Data:", profilePicsData);

        // Map profile pictures data to users
        const usersWithPictures = filteredUsers.map((user) => {
          const pictureData = profilePicsData.find((pic) => pic.user_id === user._id);
          return {
            ...user,
            picture: pictureData?.picture || "",
          };
        });

        setUsers(usersWithPictures);
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
                className={selectedConversation?._id === user._id ? "active" : ""}
                data-user-id={user._id}
              >
                <img
                  src={
                    user.picture && user.picture !== "" // If the picture exists
                      ? `data:image/jpeg;base64,${user.picture}` // Display profile picture from base64 binary
                      : `https://via.placeholder.com/50?text=${
                          user.first_name?.charAt(0) || "U"
                        }${user.last_name?.charAt(0) || ""}` // Fallback to placeholder
                  }
                  alt={`${user.first_name || "Unknown"} ${user.last_name || ""}`}
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
