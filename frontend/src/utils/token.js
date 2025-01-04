import { jwtDecode } from "jwt-decode"; // Correct import

export const getUserEmail = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    const decodedToken = jwtDecode(token); // Decoding the token
    return decodedToken.email; // Access the email from the decoded token
  }
  return null; // Return null if no token is available
};
