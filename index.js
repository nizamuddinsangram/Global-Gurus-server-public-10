const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 7000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vshvqji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const placesCollection = client.db("southeastDB").collection("places");

    app.post("/myPlaces", async (req, res) => {
      const places = req.body;
      const result = await placesCollection.insertOne(places);
      res.send(result);
    });
    app.get("/myPlaces", async (req, res) => {
      const result = await placesCollection.find().toArray();
      res.send(result);
    });
    app.get("/myPlaces/:email", async (req, res) => {
      const filter = req.params.email;
      const result = await placesCollection
        .find({ user_email: req?.params?.email })
        .toArray();
      res.send(result);
    });
    app.delete("/myPlaces/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await placesCollection.deleteOne(query);
      res.send(result);
    });
    //single data loaded api
    app.get("/myPlaces/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
