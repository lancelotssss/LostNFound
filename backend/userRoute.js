const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"})

let userRoutes = express.Router()
const SALT_ROUNDS = 6


userRoutes.route("/register").post(async (req, res) => {
  const db = database.getDb();
  try {
    const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    const mongoObject = {
      uid: Date.now().toString(),
      role: "student",
      name: req.body.name || "Unknown",
      email: req.body.email || "unknown@example.com",
      password: hash,
      studentId: req.body.studentId || "",
      phone: req.body.phone || "",
      status: "active",
      lastLogin: null,
      availableClaim: 3,
      availableFound: 5,
      availableMissing: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("student_db").insertOne(mongoObject);

    const mongoAuditObject = {
      aid: `A-${Date.now()}`,
      action: "REGISTER",
      targetUser: mongoObject.email,
      performedBy: "system",
      timestamp: new Date(),
      ticketId: null,
      details: `User ${mongoObject.email} registered successfully.`,
    };

    await db.collection("audit_db").insertOne(mongoAuditObject);

    res.json({ student: mongoObject, audit: mongoAuditObject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Found
    userRoutes.route("/main/found-items").get(verifyToken, async (request, response) => {
        try {
            let db = database.getDb()

            // Filter reports where reportType = "Found"
            let foundReports = await db.collection("lost_found_db")
                                    .find({})
                                    .toArray()

            // Return results safely
            response.json({ count: foundReports.length, results: foundReports })
        } catch (err) {
            response.status(500).json({ error: err.message })
        }
    })

    //Found
    userRoutes.route("/main/claim-items").get(verifyToken, async (request, response) => {
        try {
            let db = database.getDb()

            // Filter reports where reportType = "Found"
            let foundReports = await db.collection("claims_db")
                                    .find({})
                                    .toArray()

            // Return results safely
            response.json({ count: foundReports.length, results: foundReports })
        } catch (err) {
            response.status(500).json({ error: err.message })
        }
    })

    function verifyToken(request, response, next){
         console.log("verifyToken middleware triggered");
        const authHeaders = request.headers["authorization"]
        const token = authHeaders && authHeaders.split(' ')[1]
        if (!token) {
            return response.status(401).json({message: "Authentication token is missing"}) //401 means you're not authenticated
        }
    
        jwt.verify(token, process.env.SECRETKEY, (error,user) => {
            if (error) {
            return response.status(403).json({message: "Invalid token"}) //403 may token pero hindi valid
            }
    
            request.user = user;
            next()
    
            /*mag vvalidate muna ung verify token bago magawa ung functions, 
            pag hindi nag run hindi mag rrun ung buong code, pero pag successful
            mapupunta siya sa next() which is itutuloy niya ung function */
        })
    }

    /*
//#1 Retrieve All
//http://localhost"3000/users
userRoutes.route("/users").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").find({}).toArray()        //{} - all data dito
    if (data.length > 0){
        response.json(data)     //parang return statement
    }
    else {
        throw new Error ("Data was not found")
    }
})

//#2 Retrieve One
//http://localhost"3000/users/12345
userRoutes.route("/users/:id").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").findOne({_id: new ObjectId(request.params.id)})        //{} - one data of from the _id from the mongo
    if (Object.keys(data).length > 0){
        response.json(data)     //parang return statement
    }
    else {
        throw new Error ("Data was not found")
    }
    
})


//#3 Create One
//http://localhost"3000/users/

*/
/*
//#4 Update One
//http://localhost"3000/users/
userRoutes.route("/users/:id").put(async (request, response) => {
    let db = database.getDb()
    let mongoObject = {
        $set: 
        {
            uid: request.body.uid,
            role: request.body.role,
            name: request.body.name,
            password: request.body.password,
            studentId: request.body.studentId,
            phone: request.body.phone,
            status: request.body.status,
            lastLogin: request.body.lastLogin,
            availableClaim: request.body.availableClaim,
            availableFound: request.body.availableFound,
            availableMissing: request.body.availableMissing,
            createdAt: request.body.createdAt,
            updatedAt: request.body.updatedAt
        }
        
    }
    let data = await db.collection("student_db").updateOne({_id: new ObjectId(request.params.id)}, mongoObject)      //set new data sa mongodb  
    response.json(data)
    
})

//#5 Delete One
//http://localhost"3000/users/12345
userRoutes.route("/users/:id").delete(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").deleteOne({_id: new ObjectId(request.params.id)})        //{} - one data of from the _id from the mongo
    response.json(data)    
})
*/
//#6 Login
userRoutes.route("/users/login").post(async (request, response) => {
    let db = database.getDb()

    const user = await db.collection("student_db").findOne({email: request.body.email})
    
    if (user){
        let confirmation = await bcrypt.compare(request.body.password, user.password)
        if (confirmation) {
            const token = jwt.sign(user, process.env.SECRETKEY, {expiresIn: "24h"})
            response.json({success:true, token})
        }
        else {
            response.json({success:false, message: "Incorrect Password"})
        }

    }
    else {
        response.json({success: false, message: "User not found"})
    }
    
    
})



module.exports = userRoutes

