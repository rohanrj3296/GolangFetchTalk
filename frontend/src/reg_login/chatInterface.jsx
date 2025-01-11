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
  const [viewedPicture, setViewedPicture] = useState(null); // State for viewed picture

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

        const userIds = [
          ...filteredUsers.map((user) => user._id),
          loggedInUser?._id,
        ].filter(Boolean);

        const requestBody = { userIds };
        console.log("Sending to backend:", JSON.stringify(requestBody));

        const profilePicsResponse = await fetch(
          "http://localhost:8080/getallprofilepictures",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!profilePicsResponse.ok) {
          throw new Error(
            `Error fetching profile pictures: ${profilePicsResponse.status}`
          );
        }

        const profilePicsData = await profilePicsResponse.json();
        console.log("Profile Pictures Data:", profilePicsData);

        const usersWithPictures = filteredUsers.map((user) => {
          const pictureData = profilePicsData.find(
            (pic) => pic.user_id === user._id
          );
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

  const handlePictureClick = (picture) => {
    setViewedPicture(picture);
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
                  src={
                    user.picture && user.picture !== ""
                      ? `data:image/jpeg;base64,${user.picture}`
                      : `https://via.placeholder.com/50?text=${
                          user.first_name?.charAt(0) || "U"
                        }${user.last_name?.charAt(0) || ""}`
                  }
                  alt={`${user.first_name || "Unknown"} ${
                    user.last_name || ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the conversation selection
                    handlePictureClick(
                      user.picture
                        ? `data:image/jpeg;base64,${user.picture}`
                        : `https://via.placeholder.com/50?text=${
                            user.first_name?.charAt(0) || "U"
                          }${user.last_name?.charAt(0) || ""}`
                    );
                  }}
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
              alt="Profile"
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

export default ChatInterface;