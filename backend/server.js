const connect = require("./connect") 
const express = require("express")
const cors = require("cors")
const posts = require("./postRoutes")
const users = require("./userRoute") //added for login register


const app = express()
const PORT = 3110

app.use(cors())
app.use(express.json())
app.use(posts)
app.use(users) //added for login register
app.use("/users", users);  // -> /users/register, /users/login, etc.
app.use("/cli", posts);   


app.listen(PORT, () => {
    connect.connectToServer()
    console.log(`Server is running in port ${PORT}`)
})