const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const bcrypt = require("bcrypt")

let userRoutes = express.Router()
const SALT_ROUNDS = 6

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
userRoutes.route("/register").post(async (request, response) => {
        let db = database.getDb();

    try {
        const hash = await bcrypt.hash(request.body.password, SALT_ROUNDS);

        // Create the user object
        let mongoObject = { 
            uid: Date.now().toString(), // or UUID
            role: "student",
            name: request.body.name,
            email: request.body.email,
            password: hash,
            studentId: request.body.studentId,
            phone: request.body.phone,
            status: "active",
            lastLogin: null,
            availableClaim: 0,
            availableFound: 0,
            availableMissing: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert user into student_db
        let data = await db.collection("student_db").insertOne(mongoObject);

        // Automatically create audit record
        let mongoAuditObject = { 
            uid: mongoObject.uid,
            action: "REGISTER",
            targetUser: mongoObject.email,
            performedBy: "system",
            timestamp: new Date(),
            ticketId: null,
            details: `User ${mongoObject.email} registered successfully.`
        };

        let auditData = await db.collection("audit_db").insertOne(mongoAuditObject);

        response.json({ student: data, audit: auditData });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});
    

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

//#6 Login
userRoutes.route("/users/login").post(async (request, response) => {
    let db = database.getDb()

    const user = await db.collection("student_db").findOne({email: request.body.email})
    
    if (user){
        let confirmation = await bcrypt.compare(request.body.password, user.password)
        if (confirmation) {
            response.json({success:true, user})
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

