import React, { useState, useEffect } from "react";
import "./profileModal.css"; // CSS file for styling the modal
import Swal from "sweetalert2";

const ProfileModal = ({ currentUser, onClose }) => {
  const [showPictureOptions, setShowPictureOptions] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [viewedPicture, setViewedPicture] = useState(null); // State for viewed picture

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (currentUser) {
        try {
          const response = await fetch("http://localhost:8080/getallprofilepictures", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds: [currentUser._id] }),
          });

          if (response.ok) {
            const profilePicsData = await response.json();
            const pictureData = profilePicsData.find(
              (pic) => pic.user_id === currentUser._id
            );
            setProfilePicture(pictureData?.picture || "");
          } else {
            console.error("Failed to fetch profile picture.");
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    fetchProfilePicture();
  }, [currentUser]);

  if (!currentUser) {
    return null; // Don't render the modal if the currentUser is null
  }

  const handleProfilePictureClick = () => {
    setShowPictureOptions(!showPictureOptions);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", currentUser._id); // Include user ID or relevant identifier

      // Log the formData contents
      

      try {
        const response = await fetch("http://localhost:8080/uploadprofilepicture", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
           Swal.fire({
                    icon: "success",
                    title: "Profile Picture Updated Successfully!!",
                    showConfirmButton: true,
                  });
          // Fetch the updated profile picture
          const updatedProfilePicsResponse = await fetch("http://localhost:8080/getallprofilepictures", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds: [currentUser._id] }),
          });

          if (updatedProfilePicsResponse.ok) {
            const updatedProfilePicsData = await updatedProfilePicsResponse.json();
            const updatedPictureData = updatedProfilePicsData.find(
              (pic) => pic.user_id === currentUser._id
            );
            setProfilePicture(updatedPictureData?.picture || "");
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed To Update Profile Picture!! ",
            showConfirmButton: true,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed To Update Profile Picture!! ",
          showConfirmButton: true,
        });
      }
    }
  };

  const handleViewClick = () => {
    setViewedPicture(profilePicture ? `data:image/jpeg;base64,${profilePicture}` : null);
  };

  return (
    <div className="profile-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="profile-header">
          <div
            className="profile-picture-container"
            onClick={handleProfilePictureClick}
          >
            <img
              src={
                profilePicture
                  ? `data:image/jpeg;base64,${profilePicture}`
                  : `https://via.placeholder.com/100?text=${
                      currentUser.first_name?.charAt(0) || "U"
                    }${currentUser.last_name?.charAt(0) || ""}`
              }
              alt="Profile"
              className="profile-picture"
            />
          </div>
          {showPictureOptions && (
            <div className="picture-options">
              <button className="view-btn" onClick={handleViewClick}>View</button>
              <label className="change-btn">
                Change
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>Profile Details</h2>
          <p>
            <strong>First Name:</strong> {currentUser.first_name || "N/A"}
          </p>
          <p>
            <strong>Last Name:</strong> {currentUser.last_name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email || "N/A"}
          </p>
        </div>
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
                fontSize: "36px",
                color: "white",
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

export default ProfileModal;