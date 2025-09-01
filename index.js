const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()



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

async function run() {
  try {
      // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
//    
  const bookCollection = client.db("libraryDB").collection("books");
  app.get("/books",async (req,res)=>{
    try{
      const result = await bookCollection.find().toArray();
      res.send(result)
    }
    catch(err){
      res.status(500).send({error:"Failed to fetch books"})
    }
  })
  app.get("/books/category/:category", async(req,res)=>{
    try{
      const category = req.params.category;
      const result = await bookCollection.find({category: category}).toArray();
      res.send(result);
    }
    catch (err){
      res.status(500).send({error:"Failed to fetch category books"});
    }
  })
  app.get("/book/:id", async(req,res)=>{
    const id = req.params.id;
    const book = await bookCollection.findOne({_id: new ObjectId(id)})
    res.send(book)
  })
 app.get("/books",async(req,res)=>{
  const result = await bookCollection.find().toArray;
  res.send(result)
 })
    app.post("/books", async (req,res)=>{
      try{
        const newBook = req.body;
      const result = await bookCollection.insertOne(newBook);
          res.status(201).send(result);
      } catch(error){
            res.status(500).send({ message: "Failed to add book" });

      }
    })
    app.put("/book/:id",async(req,res)=>{
      try{
        const id = req.params.id;
        const updateData = req.body;
        const result = await bookCollection.updateOne(
          {
            _id:new ObjectId(id)
          },
          {
            $set : updateData
          }
        )
        res.send(result);
      } catch(err){
        res.status(500).send({message:"Failed to update book"})
      }
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send(" Library Management System Server is Running...")
})
app.listen(port, () =>{
    console.log(`Server is running on port:${port}`);
    
})