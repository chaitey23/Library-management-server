const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
app.use(cors())
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pkaqrby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized Token" })
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Initialize database collections
let bookCollection, borrowedCollection;


app.get("/books", async (req, res) => {
  try {
    const result = await bookCollection.find().toArray();
    res.send(result)
  }
  catch (err) {
    res.status(500).send({ error: "Failed to fetch books" })
  }
});

app.get("/books/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const result = await bookCollection.find({ category: category }).toArray();
    res.send(result);
  }
  catch (err) {
    res.status(500).send({ error: "Failed to fetch category books" });
  }
});

app.get("/book/:id", async (req, res) => {
  const id = req.params.id;
  const book = await bookCollection.findOne({ _id: new ObjectId(id) })
  res.send(book)
});

app.post("/books", verifyFirebaseToken, async (req, res) => {
  try {
    const newBook = req.body;
    const result = await bookCollection.insertOne(newBook);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to add book" });
  }
});

app.put("/book/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const result = await bookCollection.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: updateData
      }
    )
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update book" })
  }
});

// borrowed books
app.post('/borrow/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Book ID" });
    }
    const { userName, userEmail, returnDate } = req.body;
    const alreadyBorrowed = await borrowedCollection.findOne({ bookId: id, userEmail, returned: { $ne: true } })
    if (alreadyBorrowed) {
      return res.status(400).send({ message: "You already borrowed this book. Please return it first." })
    }
    const book = await bookCollection.findOne({ _id: new ObjectId(id) })
    if (!book) {
      return res.status(404).send({ message: "Book not Found" })
    }
    if (book.quantity <= 0) {
      return res.status(400).send({ message: "No copies available" })
    }
    const borrowedInfo = {
      bookId: id,
      bookName: book.bookName,
      bookImage: book.bookImage,
      bookCategory: book.category,
      bookAuthor: book.author,
      userName,
      userEmail,
      returnDate,
      borrowedAt: new Date(),
      returned: false
    }
    await borrowedCollection.insertOne(borrowedInfo);
    await bookCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { quantity: -1 } }
    )
    res.send({ message: "Book borrowed successfully" })
  } catch (err) {
    console.error("borrow Error:", err)
    res.status(500).send({ message: "Failed to borrow book", error: err.message })
  }
});

app.get("/borrowed-books/:email", verifyFirebaseToken, async (req, res) => {
  try {
    const userEmail = req.params.email;
    const borrowedBooks = await borrowedCollection.find({ userEmail, returned: { $ne: true } })
      .toArray()
    res.send(borrowedBooks)
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch borrowed books" })
  }
});

app.put("/borrowed-books/return/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid borrowed book ID" })
    }
    const objectId = new ObjectId(id);
    const borrowedRecord = await borrowedCollection.findOne({ _id: objectId });
    if (!borrowedRecord) {
      return res.status(404).send({ message: "Borrowed record not found" });
    }
    await borrowedCollection.updateOne(
      { _id: objectId },
      { $set: { returned: true, returnedAt: new Date() } }
    )
    await bookCollection.updateOne(
      { _id: new ObjectId(borrowedRecord.bookId) },
      { $inc: { quantity: 1 } }
    )
    res.send({ message: "Book returned successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Failed to return book", error: err.message });
  }
});


app.get('/', (req, res) => {
  res.send(" Library Management System Server is Running...")
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();

    // Initialize collections after connection
    bookCollection = client.db("libraryDB").collection("books");
    borrowedCollection = client.db("libraryDB").collection("borrowedBooks");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start the server only after successful MongoDB connection
    app.listen(port, () => {
      console.log(`Server is running on port:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

run().catch(console.dir);
