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
    const countryCollection = client.db("southeastDB").collection("country");
    app.post("/myPlaces", async (req, res) => {
      const places = req.body;
      const result = await placesCollection.insertOne(places);
      res.send(result);
    });
    app.get("/myPlaces", async (req, res) => {
      const result = await placesCollection.find().toArray();
      res.send(result);
    });
    //single data loaded api
    app.get("/myList/:email", async (req, res) => {
      const filter = req.params.email;
      //   console.log("my email", filter);
      const result = await placesCollection
        .find({ user_email: req?.params?.email })
        .toArray();
      res.send(result);
    });
    app.get("/singleList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await placesCollection.findOne(query);
      res.send(result);
    });
    // search related api
    app.get("/search", async (req, res) => {
      const result = await placesCollection
        .aggregate([
          {
            $addFields: {
              average_cost_numeric: { $toInt: "$average_cost" }, // Convert to integer
            },
          },
          { $sort: { average_cost_numeric: -1 } }, // Sort by the numeric field
        ])
        .toArray();
      res.send(result);
    });
    // app.get("/search", async (req, res) => {
    //   const { sort } = req.query;
    //   console.log(sort);
    //   let sortOrder = 1;
    //   if (sort === "desc") {
    //     sortOrder = -1;
    //   }
    //   const result = await placesCollection
    //     .aggregate([
    //       {
    //         $addFields: {
    //           average_cost_numeric: { $toInt: "$average_cost" }, // Convert string to number
    //         },
    //       },
    //       { $sort: { average_cost_numeric: sortOrder } }, // Sort by the numeric version of average_cost
    //       { $limit: 6 }, // Limit to 6 results
    //     ])
    //     .toArray();
    //   // const result = await placesCollection
    //   //   .find()
    //   //   .sort({ average_cost: sortOrder })
    //   //   .limit(6)
    //   //   .toArray();
    //   res.send(result);
    // });

    // details related api
    // app.get("/details/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await placesCollection.findOne(query);
    //   res.send(result);
    // });
    //details related api end
    app.delete("/myPlaces/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await placesCollection.deleteOne(query);
      res.send(result);
    });
    // update related api
    app.put("/myPlaces/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const place = req.body;
      console.log(place);
      const updatedPlace = {
        $set: {
          tourist_spot_name: place.tourist_spot_name,
          country_Name: place.country_Name,
          image: place.image,
          location: place.location,
          short_description: place.short_description,
          average_cost: place.average_cost,
          seasonality: place.seasonality,
          travel_time: place.travel_time,
          totalVisitorsPerYear: place.totalVisitorsPerYear,
        },
      };
      const result = await placesCollection.updateOne(
        filter,
        updatedPlace,
        options
      );
      res.send(result);
    });
    //country related api
    app.get("/country", async (req, res) => {
      const result = await countryCollection.find().toArray();
      res.send(result);
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
