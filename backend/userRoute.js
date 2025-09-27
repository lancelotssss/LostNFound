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
      updatedAt: new Date()
      
    };

    await db.collection("student_db").insertOne(mongoObject);

    const mongoAuditObject = {
      aid: `A-${Date.now()}`,
      action: "REGISTER",
      targetUser: mongoObject.email,  // now guaranteed to have value
      performedBy: "system",
      timestamp: new Date(),
      ticketId: null,
      details: `User ${mongoObject.email} registered successfully.`
    };

    await db.collection("audit_db").insertOne(mongoAuditObject);

    res.json({ student: mongoObject, audit: mongoAuditObject });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    

//Report
    userRoutes.route("/cli/report").post(async (request, response) => {
        let db = database.getDb()

        let mongoObject = {
            uid: request.body.uid,
            title: request.body.title,
            keyItem: request.body.keyItem,
            itemBrand: request.body.itemBrand,
            description: request.body.description,
            status: request.body.status,
            reportType: request.body.reportType,
            reportedBy: request.body.reportedBy,
            approvedBy: request.body.approvedBy,
            location: request.body.location,
            dateReported: request.body.dateReported,                //for found item
            startDate: request.body.startDate,                      //for lost item
            endDate: request.body.endDate,                          //for lost item
            photoUrl: request.body.photoUrl,
            updatedAt: request.body.updatedAt
        }

        let mongoAuditObject = { 
            uid: request.body.uid,
            action: request.body.action,
            targetUser: request.body.targetUser,
            performedBy: request.body.performedBy,
            timestamp: request.body.timestamp,
            ticketId: request.body.ticketId,
            details: request.body.details 
        }
        try {
            let data = await db.collection("lost_found_db").insertOne(mongoObject)
            let auditData = await db.collection("audit_db").insertOne(mongoAuditObject)

            response.json({ report: data, audit: auditData })
        } catch (err) {
            response.status(500).json({ error: err.message })
        }
    })

    //Admin Get Lost-items
    userRoutes.route("/main/lost-items").get(async (req, res) => {
  try {
    const db = database.getDb();

    // Return all documents, no filter
    const allReports = await db.collection("lost_found_db").find({reportType:"found"}).toArray();

    console.log("Reports fetched:", allReports.length);
    res.json({ count: allReports.length, results: allReports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


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
            const token = jwt.sign(user, process.env.SECRETKEY, {expiresIn: "1h"})
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

