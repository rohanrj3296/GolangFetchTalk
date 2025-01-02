import React from "react";
import "../reg_login/reg.css";

const RegistrationForm = () => {
  return (
    <div className="container">
      <nav className="navbar">
        <span>
            <image src="/GoChatAppLogo.jpg">FetchTalk</image>
        </span>
        <ul>
          <li>Home</li>
          <li>Sign-in</li>
        </ul>
      </nav>
      <div className="form-container">
        <h1>Sign-up To FetchTalk Now</h1>
        
        <form>
          <label>First Name:</label>
          <input type="text" name="firstName" required />
          <label>Last Name:</label>
          <input type="text" name="lastName" required />
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;