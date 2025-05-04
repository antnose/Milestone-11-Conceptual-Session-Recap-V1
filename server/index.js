const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Cors config
const corsOption = {
  origin: ["http://localhost:5173/"],
  credential: true,
  optionSuccessStatus: 200,
};

// All Middle Ware is here
app.use(express.json());
app.use(cors(corsOption));

app.get("/", (req, res) => {
  res.send("Hello This is server");
});

app.listen(port, () => {
  console.log(`Your server running on  http://localhost:${port}`);
});
