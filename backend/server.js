const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const posts = require("./postRoutes");
const users = require("./userRoute"); 

const app = express();
const PORT = 3110;

app.use(cors());
app.use(express.json());
app.use(posts);
app.use(users);

// Start server after DB connection
(async () => {
  await connect.connectToServer();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
