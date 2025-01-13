package dbrepo

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	//"github.com/gorilla/mux"
	"github.com/dgrijalva/jwt-go"
	"github.com/rohanrj3296/GolangChatWebApp/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)
type Repository struct{
	DB *DBoperations
}


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
	//generating jwt token
	token:=jwt.NewWithClaims(jwt.SigningMethodHS256,jwt.MapClaims{
		"email":loginForm.Email,
		"exp":time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString,err:=token.SignedString([]byte(os.Getenv("JWT_SECRET_KEY")))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": tokenString})

	
	
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
func (m *Repository) SaveMessageHandler(w http.ResponseWriter, r *http.Request) {
    var message models.Message

    // Decode JSON payload
    err := json.NewDecoder(r.Body).Decode(&message)
    if err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }
	 // Check if the ActualMessage field is empty
	 if message.ActualMessage == "" {
        http.Error(w, "Message text cannot be empty", http.StatusBadRequest)
        return
    }

    // Validate and convert sender_id
    _, err = primitive.ObjectIDFromHex(message.SenderID)
    if err != nil {
        http.Error(w, "Invalid sender_id format", http.StatusBadRequest)
        return
    }

    // Validate and convert receiver_id
    _, err = primitive.ObjectIDFromHex(message.ReceiverID)
    if err != nil {
        http.Error(w, "Invalid receiver_id format", http.StatusBadRequest)
        return
    }

    // Set timestamps
    now := primitive.NewDateTimeFromTime(time.Now())
    message.CreatedAt = now
    message.UpdatedAt = now
	fmt.Println(message)

    // Insert message into the database using InsertMessageIntoDB
    err = m.DB.InsertMessageIntoDB(message)
    if err != nil {
        http.Error(w, "Error saving message", http.StatusInternalServerError)
        return
    }

    // Respond with success
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"message": "Message saved successfully"})
}
// Handler to retrieve messages in chronological order
func (m *Repository) GetMessagesWithSenderReceiverIDSHandler(w http.ResponseWriter, r *http.Request) {
    // Check if the request method is POST
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }
    // Define a struct to parse the JSON request body
    var requestBody struct {
        SenderID   string `json:"sender_id"`
        ReceiverID string `json:"receiver_id"`
    }

    // Decode the JSON body
    if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
        http.Error(w, "Invalid JSON body", http.StatusBadRequest)
        return
    }
	fmt.Println(requestBody.SenderID)
	fmt.Println(requestBody.ReceiverID)
    // Validate the parsed data
    if requestBody.SenderID == "" || requestBody.ReceiverID == "" {
        http.Error(w, "Missing sender_id or receiver_id in the request body", http.StatusBadRequest)
        return
    }

    // Fetch messages from the database using sender_id and receiver_id
    messages, err := m.DB.GetMessagesWhereCurrentUserIsSender(requestBody.SenderID, requestBody.ReceiverID)
    if err != nil {
        http.Error(w, fmt.Sprintf("Error fetching messages: %v", err), http.StatusInternalServerError)
        return
    }

    // Set response header to application/json
    w.Header().Set("Content-Type", "application/json")

    // Encode the messages to JSON and write the response
    if err := json.NewEncoder(w).Encode(messages); err != nil {
        http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
        return
    }
}

func (m *Repository) UploadProfilePicToDB(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form
	err := r.ParseMultipartForm(10 << 20) // Limit upload size to 10 MB
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Get the uploaded file
	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "File upload failed", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read file content into fileBytes
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, "Unable to read file", http.StatusInternalServerError)
		return
	}

	// Call the function to upload the image to the DB
	err = m.DB.UploadImageToDB(r.FormValue("userId"), fileBytes)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to upload image: %v", err), http.StatusInternalServerError)
		return
	}
	fmt.Println("User ID:", r.FormValue("userId")) // Debugging log to check user ID


	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Image uploaded successfully!")
}
func (m *Repository) GetAllProfilePictures(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse the JSON request body
	var request struct {
		UserIds []string `json:"userIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Fetch profile pictures from the database
	profilePictures, err := m.DB.GetProfilePictures(request.UserIds)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch profile pictures: %v", err), http.StatusInternalServerError)
		return
	}

	// Prepare the response
	response := make([]map[string]interface{}, 0)
	for _, userID := range request.UserIds {
		picture, exists := profilePictures[userID]
		if !exists {
			// User ID not found in the database
			response = append(response, map[string]interface{}{
				"user_id": userID,
				"picture": "",
			})
		} else {
			// User ID found, include the picture
			response = append(response, map[string]interface{}{
				"user_id": userID,
				"picture": picture,
			})
		}
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}