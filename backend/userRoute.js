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
    // Check for duplicate email or studentId
    const existingUser = await db.collection("student_db").findOne({
      $or: [
        { email: req.body.email },
        { studentId: req.body.studentId }
      ]
    });

    if (existingUser) {
        if (existingUser.email === req.body.email) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        if (existingUser.studentId === req.body.studentId) {
            return res.status(400).json({ success: false, message: "Student ID already exists" });
        }
        }

    // Hash password
    const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    const mongoObject = {
      sid: `A-${Date.now()}`,
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
      performedBy: "System",
      timestamp: new Date(),
      ticketId: "",
      details: `User ${mongoObject.email} registered successfully.`,
    };

    await db.collection("audit_db").insertOne(mongoAuditObject);

    res.json({ success: true, student: mongoObject, audit: mongoAuditObject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

userRoutes.route("/users/logout").post(verifyToken, async (req, res) => {
  let db = database.getDb();
  const studentId = req.user?.studentId;
  const user = await db.collection("student_db").findOne({ studentId });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const mongoAuditObject = {
    aid: `A-${Date.now()}`,
    action: "LOG_OUT",
    targetUser: user.studentId,
    performedBy: "System",
    timestamp: new Date(),
    ticketId: "",
    details: `User ${user.studentId} logged out successfully.`,
  };

  await db.collection("audit_db").insertOne(mongoAuditObject);

  return res.json({ success: true, role: user.role });
});

//#6 Login
userRoutes.route("/users/login").post(async (request, response) => {
    console.log("Login route triggered for:", request.body.email);

    let db = database.getDb()
    const user = await db.collection("student_db").findOne({email: request.body.email})

    if (user){
        console.log("User found:", user.studentId);

        let confirmation = await bcrypt.compare(request.body.password, user.password)
        if (confirmation) {
            console.log("Password correct, issuing token...");

            const tokenPayLoad = {
                id: user._id,
                name: user.name,
                password: user.password,
                studentId: user.studentId,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                phone: user.phone,
                password: user.password
            }
            const token = jwt.sign(tokenPayLoad, process.env.SECRETKEY)

            const mongoAuditObject = {
                aid: `A-${Date.now()}`,
                action: "LOGIN",
                targetUser: user.studentId,
                performedBy: "System",
                timestamp: new Date(),
                ticketId: null,
                details: `User ${user.studentId} logged in successfully.`,
            };

            console.log("Inserting audit record:", mongoAuditObject);

            await db.collection("audit_db").insertOne(mongoAuditObject);
            return response.json({ success: true, token, role: user.role });
        }
        else {
            return response.json({success:false, message: "Incorrect Password"})
        }
    }
    else {
        return response.json({success: false, message: "User not found"})
    }
})



//Users
//HOME
userRoutes.get("/home", verifyToken, async (req, res) => {
  try {
    console.log("Backend /cli/home hit!", req.user); // <-- check if this logs
    const db = database.getDb();
    const studentId = req.user?.studentId;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized: No student ID" });
    }

    const studentReports = await db
      .collection("lost_found_db")
      .find({ reportedBy: studentId })
      .toArray();
    const countFounds = await db.collection("lost_found_db").find({reportedBy: studentId, reportType: "Lost" }).toArray();
    const countLosts = await db.collection("lost_found_db").find({reportedBy: studentId, reportType: "Found" }).toArray();
    console.log("Found reports:", studentReports); 

    res.json({ count: studentReports.length, results: studentReports, countFound: countFounds, countLost: countLosts});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//REPORT

userRoutes.route("/report").post(verifyToken, async (req, res) => {
    try {
    const db = database.getDb()
        const studentId = req.user?.studentId;

    const mongoReport = {
        tid: `T-${Date.now()}`,
        title: req.body.title || "No title",
        keyItem: req.body.keyItem || "No item",
        itemBrand: req.body.itemBrand || "No brand provided",
        description: req.body.description || "No description provided",
        status: "pending",
        reportType: req.body.reportType,
        reportedBy: studentId,
        approvedBy: "",
        location: req.body.location || "No location provided",
        dateReported: new Date,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        photoUrl: req.body.photoUrl || "No image provided",
        updatedAt: new Date
    }
    await db.collection("lost_found_db").insertOne(mongoReport);
    const reportType = req.body.reportType?.toLowerCase();
    const reportAuditMongo = {
        aid: `A-${Date.now()}`,
        action: reportType === "lost"
        ? "SUBMIT_MISSING"
        : reportType === "found"
            ? "SUBMIT_FOUND"
            : "UNKNOWN",
        targetUser: "",
        performedBy: `${studentId}`,
        timestamp: new Date,
        ticketId: mongoReport.tid,
        details: reportType === "lost"
        ? `${studentId} filed a missing item ${mongoReport.tid}.`
        : reportType === "found"
        ? `${studentId} filed a found item ${mongoReport.tid}.` 
        : `${studentId} filed a report ${mongoReport.tid}.`
    }
    await db.collection("audit_db").insertOne(reportAuditMongo);
    res.json({ success: true, report: mongoReport, audit: reportAuditMongo });
    }
    catch (err)
    {
         console.error(err);
    res.status(500).json({ success: false, error: err.message });
    }
    })
    

    //SETTINGS
    userRoutes.route("/settings/edit").put(verifyToken, async (req, res) => {
        try {
    const db = database.getDb();
    const studentId = req.user?.studentId;
    const { phone } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const result = await db.collection("student_db").updateOne(
      { studentId },
      { $set: { phone } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "No changes were made" });
    }
     const reportAuditMongo = {
        aid: `A-${Date.now()}`,
        action: "UPDATE_USER",
        targetUser: "",
        performedBy: `${studentId}`,
        timestamp: new Date,
        ticketId: "",
        details: `${studentId} changed a profile settings.`
    }
    await db.collection("audit_db").insertOne(reportAuditMongo);
    res.json({ success: true, message: "Phone updated successfully" });
  } catch (err) {
    console.error("Error updating phone:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }

    })

    userRoutes.route("/settings/pass").put(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;
    const { oldPassword, newPassword } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Find user
    const user = await db.collection("student_db").findOne({ studentId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.collection("student_db").updateOne(
      { studentId },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Password update failed" });
    }
    const reportAuditMongo = {
        aid: `A-${Date.now()}`,
        action: "UPDATE_USER",
        targetUser: `${studentId}`,
        performedBy: "system",
        timestamp: new Date,
        ticketId: "",
        details: `${studentId} changed a profile settings.`
    }
    await db.collection("audit_db").insertOne(reportAuditMongo);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});












//Found
    userRoutes.route("/user-items").get(verifyToken, async (req, res) => {
    try {
        let db = database.getDb();
        const studentId = req.user?.studentId; // use req, not request

        if (!studentId) {
            return res.status(401).json({ error: "Unauthorized: No student ID" });
        }

        // Fetch reports for this student
        let foundReports = await db
            .collection("lost_found_db")
            .find({ studentId })
            .toArray();

        res.json({ count: foundReports.length, results: foundReports });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});













    //Found
    userRoutes.route("/claim-items").get(verifyToken, async (request, response) => {
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
            mapupunta siya sa next() which is itutuloy niya ung function  */
        })
    }



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



module.exports = userRoutes

