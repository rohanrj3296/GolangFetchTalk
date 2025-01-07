import axios from "axios";

const BASE_URL = "http://localhost:8080"; // Replace with your backend URL

// Function to send a message
export const sendMessageToBackend = async (messageData) => {
  try {
    const response = await axios.post(`${BASE_URL}/savemessage`, messageData);
    return response.data; // Return backend response if needed
  } catch (error) {
    console.error("Error sending message(Server):", error);
    throw error; // Throw error for the calling function to handle
  }
};
