const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Cors config
const corsOption = {
  origin: ["http://localhost:5173"],
  credential: true,
  optionSuccessStatus: 200,
};

// All Middle Ware is here
app.use(express.json());
app.use(cors(corsOption));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.to58y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const jobsCollection = client.db("soloSphere").collection("jobs");
    const bidsCollection = client.db("soloSphere").collection("bids");

    // Get all Jobs Data from MongoDB
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // get a single job data from db using job id
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // Save a bid data in database
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      console.log(bidData);
      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    });

    //  Save a job in bd
    app.post("/job", async (req, res) => {
      const jobData = req.body;
      console.log(jobData);
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello This is server");
});

app.listen(port, () => {
  console.log(`Your server running on  http://localhost:${port}`);
});
