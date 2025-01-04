package dbrepo

import (
	"encoding/json"
	"fmt"
	"net/http"

	//"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/rohanrj3296/GolangChatWebApp/internal/models"
	"golang.org/x/crypto/bcrypt"
)
type Repository struct{
	DB *DBoperations
}

var store = sessions.NewCookieStore([]byte("your-secret-key"))

// RegistrationHandler handles the user registration form submission
func (m *Repository) RegistrationHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	// Parse the incoming JSON payload
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	exists, err := m.DB.CheckEmailExists(user.Email)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}
	// Hash the user's password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword) // Store the hashed password
	// Insert the user into the database
	err = m.DB.InsertUserIntoDB(user)
	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}
	// Respond with success
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
func (m *Repository) LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decode the login form data
	var loginForm models.User
	err := json.NewDecoder(r.Body).Decode(&loginForm)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Fetch the hashed password from the database
	hashedPassword, err := m.DB.GetHashedPasswordByEmail(loginForm.Email)
	if err != nil {
		http.Error(w, "User not found or database error", http.StatusInternalServerError)
		return
	}

	// Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(loginForm.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Start a session for the logged-in user
	session, err := store.Get(r, "user-session")
	if err != nil {
		http.Error(w, "Error getting session", http.StatusInternalServerError)
		return
	}

	// Store user email in session (or other details)
	session.Values["email"] = loginForm.Email
	err = session.Save(r, w)
	if err != nil {
		http.Error(w, "Error saving session", http.StatusInternalServerError)
		return
	}

	// If login is successful, return a response
	response := map[string]interface{}{
		"status": "Login successful",
		"email":  loginForm.Email, // Send the email back in the response
	}

	// Set response headers and encode the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}
func (m *Repository) AllUsersHandler(w http.ResponseWriter, r *http.Request) {
    // Check if the request method is GET
    if r.Method != http.MethodGet {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    // Fetch all users from the database
    users, err := m.DB.GetAllUserNames()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error fetching users: %v", err), http.StatusInternalServerError)
        return
    }

    // Set response header to application/json
    w.Header().Set("Content-Type", "application/json")

    // Encode the users to JSON and write the response
    if err := json.NewEncoder(w).Encode(users); err != nil {
        http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
        return
    }
}
func (m *Repository) GetUserFromSession(w http.ResponseWriter, r *http.Request) {
	// Get the session
	session, err := store.Get(r, "user-session")
	if err != nil {
		http.Error(w, `{"error":"Error getting session"}`, http.StatusInternalServerError)
		return
	}

	// Retrieve the email from session
	email, ok := session.Values["email"].(string)
	if !ok || email == "" {
		http.Error(w, `{"error":"No user found in session"}`, http.StatusUnauthorized)
		return
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Respond with the user's email
	response := map[string]string{
		"email": email,
	}
	json.NewEncoder(w).Encode(response)
}
