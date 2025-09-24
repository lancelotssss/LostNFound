const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId

let postRoutes = express.Router()

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


//#3 Create One
//http://localhost"3000/register/
postRoutes.route("/register").post(async (request, response) => {
    let db = database.getDb()
    let mongoObject = {
        uid: request.body.title,
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
    let data = await db.collection("student_db").insertOne(mongoObject)      //add data sa mongodb  
    response.json(data)
    
})

//#4 Update One
//http://localhost"3000/register/
postRoutes.route("/register/:id").put(async (request, response) => {
    let db = database.getDb()
    let mongoObject = {
        $set: 
        {
            uid: request.body.title,
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

module.exports = postRoutes