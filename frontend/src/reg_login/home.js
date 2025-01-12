import React from "react";
import { Link } from "react-router-dom";
import "../reg_login/home.css"; // Assuming you have a home.css for styling

const Home = () => {
  return (
    <div className="home-container">
    
      <div className="home-content">
        <h1 className="home-title">FetchTalk</h1>
        <p className="home-description">Share and Communicate!!!</p>
        <div className="buttons">
            
            <Link to="/register" id="sign-up" style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
                margin:"2cm",
              }}>
                Sign-up
              </Link>
            
            <Link to="/login" id="login" style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                cursor: "pointer",
              }}>
                Log-in
              </Link>
              
        </div>
      </div>
    </div>
  );
};

export default Home;