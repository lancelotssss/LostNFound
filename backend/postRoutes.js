

const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const jwt = require ('jsonwebtoken')
require("dotenv").config({path: "./config.env"}) //Access sa config.env (for SECRETKEY)
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 6;

let postRoutes = express.Router()


    //getting Profile settings
    postRoutes.route("/cli/profile/:id").get(verifyToken, async (request, response) => {
        try {
        let db = database.getDb()
        let data = await db.collection("student_db").findOne({ _id: new ObjectId(request.params.id) })
        
        if (!data) {
            return response.status(404).json({ error: "Data was not found" })
        }

        response.json(data) // parang return statement
    } catch (err) {
        response.status(500).json({ error: err.message })
    }
    })

    //changing new profile settings
    postRoutes.route("/cli/profile/:id").put(verifyToken, async (request, response) => {
        let db = database.getDb()
        let mongoObject = { 
            $set :{
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
            let data = await db.collection("student_db").updateOne({_id: new ObjectId(request.params.id)}, mongoObject)
            let auditData = await db.collection("audit_db").insertOne(mongoAuditObject)
            response.json({ student: data, audit: auditData })
            
        }
        catch (err) {
            response.status(500).json({ error: err.message })
        }
    })

    // get report history by student_id
    postRoutes.route("/cli/history/:id").get(verifyToken, async (request, response) => {
        try {
            let db = database.getDb()

            // 1. Find the student in student_db
            let student = await db.collection("student_db").findOne({ _id: new ObjectId(request.params.id) })
            if (!student) {
                return response.status(404).json({ error: "Student not found" })
            }

            // 2. Find all history from lost_found_db using the student's uid
            let history = await db.collection("lost_found_db")
                                .find({ uid: student.uid })
                                .toArray()

            // 3. Return both student + their history
            response.json({ student, history })
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




module.exports = postRoutes