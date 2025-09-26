const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId

let postRoutes = express.Router()



//Login
//postRoutes.route("")


//Register Student
//Pass the data to MongoDb

postRoutes.route("/register").post(async (request, response) => {
    let db = database.getDb()

    let mongoObject = { 
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
        let data = await db.collection("student_db").insertOne(mongoObject)
        let auditData = await db.collection("audit_db").insertOne(mongoAuditObject)

        response.json({ student: data, audit: auditData })
    } catch (err) {
        response.status(500).json({ error: err.message })
    }
})


//Client Side

//Report
postRoutes.route("/cli/report").post(async (request, response) => {
    let db = database.getDb()

    let mongoObject = {
        
    }
})

//#1 Retrieve All
//http://localhost"3000/posts
postRoutes.route("/posts").get(async (request, response) => {
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
//http://localhost"3000/posts/12345
postRoutes.route("/posts/:id").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").findOne({_id: new ObjectId(request.params.id)})        //{} - one data of from the _id from the mongo
    if (Object.keys(data).length > 0){
        response.json(data)     //parang return statement
    }
    else {
        throw new Error ("Data was not found")
    }
    
})



//#4 Update One
//http://localhost"3000/register/
postRoutes.route("/register/:id").put(async (request, response) => {
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
//http://localhost"3000/posts/12345
postRoutes.route("/posts/:id").delete(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").deleteOne({_id: new ObjectId(request.params.id)})        //{} - one data of from the _id from the mongo
    response.json(data)    
})




//Admin Side

module.exports = postRoutes