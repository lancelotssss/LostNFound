const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const posts = require("./postRoutes");
const users = require("./userRoute"); 
const admin = require("./adminRoutes")

const app = express();
const PORT = 3110;

app.use(cors());
app.use(express.json());
app.use(posts);
app.use(users);
app.use(admin);

app.use("/users", users);  
app.use("/cli", users);   
app.use("/main", admin)


app.listen(PORT, () => {
    connect.connectToServer()
    console.log(`Server is running in port ${PORT}`)
})
