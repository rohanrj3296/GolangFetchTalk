import React, { useState } from "react";
import "./profileModal.css"; // CSS file for styling the modal

const ProfileModal = ({ currentUser, onClose }) => {
  const [showPictureOptions, setShowPictureOptions] = useState(false);

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
      console.log("Posting the following data:");
      console.log("User ID:", currentUser._id);
      console.log("Image File Name:", file.name);
      console.log("Image File Type:", file.type);
      console.log("Image File Size:", file.size);
      console.log("The Image Data IS:",formData);

      try {
        const response = await fetch("http://localhost:8080/uploadprofilepicture", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          alert("Image uploaded successfully!");
        } else {
          alert("Failed to upload image.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image.");
      }
    }
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
              src={`https://via.placeholder.com/100?text=${
                currentUser.first_name?.charAt(0) || "U"
              }${currentUser.last_name?.charAt(0) || ""}`}
              alt="Profile"
              className="profile-picture"
            />
          </div>
          {showPictureOptions && (
            <div className="picture-options">
              <button className="view-btn">View</button>
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
    </div>
  );
};

export default ProfileModal;
