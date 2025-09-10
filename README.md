# 🌿 Library Management System - Server

## 📝 Project Overview  
This is the **backend** of the Library Management System built with Node.js and Express.js. It handles book management, borrowing and returning books, JWT authentication, and all CRUD operations with MongoDB. The system ensures secure and efficient communication with the frontend client.

## 🌐 Hosted URL  
[🔗 Visit Server](https://library-management-level-1.vercel.app/L)

## ✨ Key Features  
- 📚 **Book Management**: Add, update, and fetch books by category.  
- 🔐 **JWT Authentication**: Protects private routes and verifies logged-in users.  
- 📥 **Borrow & Return System**: Uses MongoDB `$inc` operator to efficiently manage book quantity.  
- 🛡 **Secure Credentials**: MongoDB URI and Firebase credentials are stored securely using environment variables.  
- ⚙️ **Error Handling**: Handles CORS, 404 errors, and other server issues gracefully.  

## 🛠️ Technologies Used  
- Node.js  
- Express.js  
- MongoDB with Mongoose  
- Firebase Admin SDK  
- JSON Web Token (JWT)  
- Cors  
- Dotenv  

## ⚙️ Setup & Installation  
Follow these steps to run the backend server locally:  

```bash
# 1. Clone the repository
git clone https://github.com/Programming-Hero-Web-Course4/b11a11-server-side-chaitet23

# 2. Navigate into the server folder
cd library-management-server   # Replace with your actual folder name if different

# 3. Install dependencies
npm install

# 4. Add environment variables in a .env file
# Example:
# PORT=5000
# MONGODB_URI=YOUR_MONGODB_URI
# FIREBASE_SERVICE_ACCOUNT=YOUR_FIREBASE_JSON_STRING
# JWT_SECRET=YOUR_SECRET_KEY

# 5. Start the server
npm start
