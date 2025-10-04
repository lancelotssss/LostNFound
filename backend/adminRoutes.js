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
          .find({ reportType: "Found" }) 
          .toArray();

          res.json({ count: foundReports.length, results: foundReports });
        } catch (err) {
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
      { $set: { status, approvedBy } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Active" ? "APPROVE_FOUND" : "DENY_FOUND",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: updateResult.tid,
      details: `${approvedBy} set item ${updateResult.tid} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, message: `Item ${status}`, audit: auditMongo });
  } catch (err) {
    console.error("Error approving/denying item:", err);
    res.status(500).json({ success: false, message: "Server error" });
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

    // ✅ update status + approvedBy
    const updateResult = await db.collection("lost_found_db").updateOne(
      { _id: objectId, reportType: "Lost" },
      { $set: { status, approvedBy } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Lost item not found" });
    }

    // 🔹 Audit log
    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Active" ? "APPROVE_LOST" : "DENY_LOST",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: itemObjectId,
      details: `${approvedBy} set lost item ${itemObjectId} status to ${status}.`,
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
          .find({ reportType: "Lost" }) 
          .toArray();

        res.json({ count: lostReports.length, results: lostReports });
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
  
 


adminRoutes.route("/logs").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();
    const audit = await db.collection("audit_db").find({}).toArray();
    res.json({ count: audit.length, results: audit });
  } catch (err) {
    console.error("Error in /logs route:", err); // log error for debugging
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.route("/manage-users").get(verifyToken, async (req, res) => {
});

adminRoutes.route("/profile").get(verifyToken, async (req, res) => {
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