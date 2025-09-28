const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const posts = require("./postRoutes");
const { userRoutes, verifyToken, authorizeRoles } = require("./userRoute");

const app = express();
const PORT = 3110;

app.use(cors());
app.use(express.json());

app.use("/users", users);  // -> /users/register, /users/login, etc.
app.use("/cli", posts);   

// Role-protected routes
app.use("/cli", verifyToken, authorizeRoles("student"), userRoutes);
app.use("/main", verifyToken, authorizeRoles("admin"), userRoutes);

app.listen(PORT, () => {
  connect.connectToServer();
  console.log(`Server is running in port ${PORT}`);
});
