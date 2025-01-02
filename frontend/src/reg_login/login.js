import "../reg_login/login.css";
import React from "react";

const LoginForm = () => {
  
  return (
    <div className="container">
      <nav className="navbar">
        <span>
            <image src="/GoChatAppLogo.jpg">FetchTalk</image>
        </span>
        <ul>
          <li>Home</li>
          <li>Sign-Up</li>
        </ul>
      </nav>
      <div className="form-container">
        <h1>Sign-In To FetchTalk Now</h1>
        
        <form>
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;