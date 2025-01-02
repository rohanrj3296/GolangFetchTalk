import React, { useState } from "react";
import axios from "axios";
import "../reg_login/reg.css";
import { Link,useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const RegistrationForm = () => {
  // State to store form input and response messages
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [responseMessage, setResponseMessage] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    try {
      const response = await axios.post("http://localhost:8080/register", formData);
      if (response.status === 201) { // Check if the status is 201 (Created)
        setResponseMessage("Registration successful!");
        navigate("/login"); // Redirect to the login page
        // To show a success message
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Redirecting to login page...",
          timer: 1500, // Auto close after 3 seconds
          showConfirmButton: false,
        });
      }
    } catch (error) {
      setResponseMessage(
        error.response?.data || "An error occurred during registration."
      );
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <span>
          <li style={{ fontWeight: "bold" }}>FetchTalk</li>
        </span>
        <ul>
          <li style={{ fontWeight: "bold" }}>Home</li>
          <li>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign-in
            </Link>
          </li>
        </ul>
      </nav>
      <div className="form-container">
        <h1>Sign-up To FetchTalk Now</h1>

        <form onSubmit={handleSubmit}>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Register</button>
        </form>

        {/* Display the response message */}
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default RegistrationForm;
