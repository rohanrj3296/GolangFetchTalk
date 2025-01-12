// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistrationForm from "./reg_login/reg"; //importing the Registration From
import LoginForm from "./reg_login/login"; //importing the Login Form
import ChatInterface from "./reg_login/chatInterface";
import Home from "./reg_login/home";



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/" element={<Home/>}/>
        
        
        
      </Routes>
    </Router>
  );
};

export default App;
