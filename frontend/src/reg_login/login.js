import "../reg_login/login.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import Swal from "sweetalert2"; 



const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const response = await axios.post("http://localhost:8080/login", formData);
      if (response.status === 200) {
        // On successful login
        setResponseMessage("Login successful!");
        navigate("/chat"); 

        // Store the token in localStorage
        localStorage.setItem("authToken", response.data.token);

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      setResponseMessage(
        error.response?.data || "An error occurred during login."
      );
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text: error.response?.data || "Invalid Credentials or Internal Server Error",
      });
    }
  };


  return (
    <div className="container">
      <nav className="navbar">
        <span>
         <li style={{fontWeight:"bold"}}>FetchTalk</li>
        </span>
        <ul>
          <li  style={{ fontWeight: "bold" }}><Link
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Home
            </Link></li>
          <li>
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign-up
            </Link>
          </li>
        </ul>
      </nav>
      <div className="form-container">
        <h1>Sign-In To FetchTalk Now</h1>

        <form onSubmit={handleSubmit}>
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
          <button type="submit">Login</button>
        </form>

        {/* Display the response message */}
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default LoginForm;
