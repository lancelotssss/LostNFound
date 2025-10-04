const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"})

let adminRoutes = express.Router()
const SALT_ROUNDS = 6

adminRoutes.route("/dashboard").get(verifyToken, async (req, res) => {
});

adminRoutes.route("/found-items").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const foundReports = await db.collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Found" } }, 
        {
          $addFields: {
            statusOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Pending"] }, then: 1 },
                  { case: { $eq: ["$status", "Active"] }, then: 2 },
                  { case: { $eq: ["$status", "Pending Claimed"] }, then: 3 },
                  { case: { $eq: ["$status", "Claimed"] }, then: 4 },
                  { case: { $eq: ["$status", "Disposed"] }, then: 5 },
                  { case: { $eq: ["$status", "Denied"] }, then: 6 }
                ],
                default: 99
              }
            }
          }
        },
        { $sort: { statusOrder: 1, dateFound: 1 } }, 
        { $project: { statusOrder: 0 } }
      ])
      .toArray();

    res.json({ count: foundReports.length, results: foundReports });
  } catch (err) {
    console.error("Error in /found-items route:", err);
    res.status(500).json({ error: err.message });
  }
});
  
adminRoutes.put("/found/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemObjectId, status, approvedBy } = req.body;

    console.log("Incoming Approve Payload:", req.body);

    if (!itemObjectId || !status || !approvedBy) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemObjectId);

    const updateResult = await db.collection("lost_found_db").updateOne(
      { _id: objectId },
      { $set: { status, approvedBy, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const item = await db.collection("lost_found_db").findOne({ _id: objectId });
  if (!item) {
  return res.status(404).json({ success: false, message: "Item not found" });
  }

    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Active" ? "APPROVE_FOUND" : "DENY_FOUND",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: item.tid,
      details: `${approvedBy} set item ${item.tid} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, message: `Item ${status}`, audit: auditMongo });
  } catch (err) {
    console.error("Error approving/denying item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

adminRoutes.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }

    const result = await db.collection("reports").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Admin delete error:", error);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
});

adminRoutes.put("/lost/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemObjectId, status, approvedBy } = req.body;

    console.log("Incoming Lost Approve Payload:", req.body);

    if (!itemObjectId || !status || !approvedBy) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemObjectId);

    const item = await db.collection("lost_found_db").findOne({ _id: objectId });
  if (!item) {
  return res.status(404).json({ success: false, message: "Item not found" });
  }

    const updateResult = await db.collection("lost_found_db").updateOne(
      { _id: objectId, reportType: "Lost" },
      { $set: { status, approvedBy, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Lost item not found" });
    }

   
    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Active" ? "APPROVE_LOST" : "DENY_LOST",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: item.tid,
      details: `${approvedBy} set lost item ${item.tid} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, message: `Lost Item ${status}`, audit: auditMongo });
  } catch (err) {
    console.error("❌ Error approving/denying lost item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



adminRoutes.route("/lost-items").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const lostReports = await db.collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Lost" } },
        {
          $addFields: {
            statusOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Pending"] }, then: 1 },
                  { case: { $eq: ["$status", "Active"] }, then: 2 },
                  { case: { $eq: ["$status", "Claimed"] }, then: 3 },
                  { case: { $eq: ["$status", "Denied"] }, then: 4 }
                ],
                default: 99
              }
            }
          }
        },
        { $sort: { statusOrder: 1, dateLost: 1 } } 
      ])
      .toArray();

    res.json({ count: lostReports.length, results: lostReports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.route("/history").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const allReports = await db.collection("lost_found_db")
      .find({})
      .sort({ dateReported: -1 }) 
      .toArray();

    res.json({ count: allReports.length, results: allReports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    adminRoutes.route("/claim-items").get(async (req, res) => {
    /*try {
      let db = database.getDb();

      const claims = await db.collection("claims_db").find().toArray();

      const results = await Promise.all(
        claims.map(async (claim) => {
          const item = await db
            .collection("lost_found_db")
            .findOne({ tid: String(claim.itemId).trim() });

          return {
            ...claim,
            itemDetails: item || null,
          };
        })
      );

      res.json({ success: true, results }); // ✅ match frontend expectation
    } catch (err) {
      console.error("❌ Error fetching claim items:", err);
      res.status(500).json({ success: false, error: err.message, results: [] });
    }
     */
  });
  
adminRoutes.route("/storage").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const foundReports = await db.collection("lost_found_db")
      .find({ reportType: "Found", status: "Active" }) 
      .sort({ dateFound: -1 }) 
      .toArray();

    res.json({ count: foundReports.length, results: foundReports });
  } catch (err) {
    console.error("Error in /storage route:", err);
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.put("/storage/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemObjectId, status, approvedBy } = req.body;

    console.log("Incoming Approve Payload:", req.body);

    if (!itemObjectId || !status || !approvedBy) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemObjectId);

    const updateResult = await db.collection("lost_found_db").updateOne(
      { _id: objectId },
      { $set: { status, approvedBy, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const item = await db.collection("lost_found_db").findOne({ _id: objectId });
  if (!item) {
  return res.status(404).json({ success: false, message: "Item not found" });
  }

    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Disposed" ? "DISPOSED_ITEM" : "CLAIMED_ITEM",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: item.tid,
      details: `${approvedBy} set item ${item.tid} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, message: `Item ${status}`, audit: auditMongo });
  } catch (err) {
    console.error("Error approving/denying item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


adminRoutes.route("/logs").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();
    const audit = await db.collection("audit_db").find({}).sort({timestamp: -1}).toArray();
    res.json({ count: audit.length, results: audit });
  } catch (err) {
    console.error("Error in /logs route:", err);
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.route("/manage-users").get(verifyToken, async (req, res) => {
});

adminRoutes.route("/profile").get(verifyToken, async (req, res) => {
});

  //------------------------------------------------------------------------SETTINGS-CONTACT------------------------------------------------------------------------
    adminRoutes.route("/settings/edit").put(verifyToken, async (req, res) => {
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
      { $set: { phone,  updatedAt:  new Date()}} 
    );
   

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "No changes were made" });
    }
     const reportAuditMongo = {
        aid: `A-${Date.now()}`,
        action: "UPDATE_USER",
        targetUser: "",
        performedBy: `${studentId}`,
        timestamp: new Date(),
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

    //------------------------------------------------------------------------SETTINGS-PASSWORD------------------------------------------------------------------------
    adminRoutes.route("/settings/pass").put(verifyToken, async (req, res) => {
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
      { $set: { password: hashedPassword, updatedAt:  new Date()} }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Password update failed" });
    }
    const reportAuditMongo = {
        aid: `A-${Date.now()}`,
        action: "UPDATE_USER",
        targetUser: "",
        performedBy: `${studentId}`,
        timestamp: new Date(),
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
  


module.exports = adminRoutes