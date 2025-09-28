const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const posts = require("./postRoutes");
const { userRoutes, verifyToken, authorizeRoles } = require("./userRoute");

const app = express();
const PORT = 3110;

app.use(cors());
app.use(express.json());

// Mount routes with base paths
app.use("/posts", posts);
app.use("/users", userRoutes);

// Role-protected routes
app.use("/cli", verifyToken, authorizeRoles("student"), posts);
app.use("/main", verifyToken, authorizeRoles("admin"), posts);

app.listen(PORT, () => {
  connect.connectToServer();
  console.log(`Server is running in port ${PORT}`);
});
