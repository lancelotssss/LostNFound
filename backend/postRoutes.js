const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const jwt = require ('jsonwebtoken')
require("dotenv").config({path: "./config.env"}) //Access sa config.env (for SECRETKEY)

let postRoutes = express.Router()



//Login
//postRoutes.route("")


//Register Student
    //Pass the data to MongoDb
    postRoutes.route("/register").post(async (request, response) => {
    const db = database.getDb();
    try {
        const hash = await bcrypt.hash(request.body.password, SALT_ROUNDS);

        // Create user object
        const mongoObject = { 
            uid: Date.now().toString(),
            role: request.body.role || "student",
            name: request.body.name,
            password: hash,
            studentId: request.body.studentId,
            email: request.body.email,
            phone: request.body.phone,
            status: request.body.status || "active",
            lastLogin: null,
            availableClaim: request.body.availableClaim || 0,
            availableFound: request.body.availableFound || 0,
            availableMissing: request.body.availableMissing || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection("student_db").insertOne(mongoObject);

        // Create audit log automatically
        const mongoAuditObject = { 
            uid: `A-${Date.now()}`, // unique audit ID
            action: "REGISTER",
            targetUser: mongoObject.email,
            performedBy: "system",
            timestamp: new Date(),
            ticketId: null,
            details: `User ${mongoObject.email} registered successfully.`
        };

        await db.collection("audit_db").insertOne(mongoAuditObject);

        response.json({ student: mongoObject, audit: mongoAuditObject });

    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

//Client Side

    //Report
    postRoutes.route("/cli/report").post(verifyToken, async (request, response) => {
        let db = database.getDb()

        let mongoObject = {
            tid: request.body.uid,
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

    //Claim
    postRoutes.route("/claim").post(verifyToken, async (request, response) => {
        let db = database.getDb()
        let mongoObject = {
            uid: request.body.uid,
            itemId: request.body.itemId,
            claimerId: request.body.claimerId,
            claimStatus: request.body.claimStatus,
            reason: request.body.reason,
            createdAt: request.body.createdAt,
            updatedAt: request.body.updatedAt,
            photoUrl: request.body.photoUrl,
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
            let data = await db.collection("claims_db").insertOne(mongoObject)
            let auditData = await db.collection("audit_db").insertOne(mongoAuditObject)

            response.json({ student: data, audit: auditData })
        } catch (err) {
            response.status(500).json({ error: err.message })
        }

    })

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

    // Get report history by student _id
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


    //Admin Side
    // Get all Found reports
    postRoutes.route("/main/lost-items").get(verifyToken, async (request, response) => {
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

    /*
    postRoutes.route("/main/lost-items").get(async (request, response) => {
    try {
        let db = database.getDb()

        // Aggregation pipeline to sort "pending" first
        let foundReports = await db.collection("lost_found_db").aggregate([
            { $match: { reportType: "Found" } },
            { 
                $addFields: { 
                    priority: { $cond: [{ $eq: ["$status", "pending"] }, 1, 2] } 
                } 
            },
            { $sort: { priority: 1, dateReported: -1 } }, // pending first, then most recent
            { $project: { priority: 0 } } // remove temporary field
        ]).toArray()

        response.json({ count: foundReports.length, results: foundReports })
    } catch (err) {
        response.status(500).json({ error: err.message })
    }
})
*/

/*
    //Search for reports
    // Search reports by category + status + date range
postRoutes.route("/cli/search").post(async (request, response) => {
    try {
        let db = database.getDb()

        const { status, category, startDate, endDate } = request.body

        // Build the filter object
        let filter = {}

        if (status) filter.status = status

        if (category) {
            // case-insensitive match
            filter.category = { $regex: category, $options: "i" }
        }

        if (startDate && endDate) {
            // filter where dateLostOrFound falls within the range
            filter.dateLostOrFound = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }

        // Query the collection
        let results = await db.collection("lost_found_db").find(filter).toArray()

        // Always return a safe response
        response.json({ count: results.length, results })
    } catch (err) {
        response.status(500).json({ error: err.message })
    }
})


/*
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
//#5 Delete One
//http://localhost"3000/posts/12345
postRoutes.route("/posts/:id").delete(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("student_db").deleteOne({_id: new ObjectId(request.params.id)})        //{} - one data of from the _id from the mongo
    response.json(data)    
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
    */

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