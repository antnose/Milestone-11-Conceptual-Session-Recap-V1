const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Cors config
const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};

// All Middle Ware is here
app.use(express.json());
app.use(cors(corsOption));
app.use(cookieParser());

// Verify jwt middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "Unauthorized access" });
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      console.log(decoded);
      req.user = decoded;
      next();
    });
  }
  console.log(token);
};

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

    // JWT Generate
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ succss: true });
    });

    // Clear Token on Logout
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ succss: true });
    });

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
      // check if it's a duplicate request
      const query = {
        email: bidData.email,
        jobId: bidData.jobId,
      };
      const alreadyApplied = await bidsCollection.findOne(query);
      if (alreadyApplied) {
        return res
          .status(400)
          .send(`You have already placed a bid on this job.`);
      }

      console.log(bidData);
      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    });

    //  Save a job data in bd
    app.post("/job", async (req, res) => {
      const jobData = req.body;
      console.log(jobData);
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    // set all jobs posted by specific user
    app.get("/jobs/:email", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const query = { "buyer.email": email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // Delete a job data from db
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    // update a job in db
    app.put("/job/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };

      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // get all bids for a user by email from db
    app.get("/my-bids/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    // Update bid status
    app.patch("/bid/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: status,
      };
      const result = await bidsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Get all jobs data from db for pagination
    app.get("/all-jobs", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;

      let query = { job_title: { $regex: search, $options: "i" } };

      if (filter) query.category = filter;

      let options = {};
      if (sort) options = { sort: { deadline: sort === "asc" ? 1 : -1 } };

      const result = await jobsCollection
        .find(query, options)
        .skip(page)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // Get all jobs data count
    app.get("/jobs-count", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        job_title: { $regex: search, $options: "i" },
      };
      if (filter) query.category = filter;
      const count = await jobsCollection.countDocuments(query);
      res.send({ count });
    });

    // Get all bid request from job owner
    app.get("/bid-requests/:email", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { "buyer.email": email };
      const result = await bidsCollection.find(query).toArray();
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
