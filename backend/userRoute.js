const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const multer = require("multer");
const supabase = require("./supabaseClient");
const upload = multer({ storage: multer.memoryStorage() });


require("dotenv").config({path: "./config.env"})

let userRoutes = express.Router()
const SALT_ROUNDS = 6


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


//------------------------------------------------------------------------REGISTER------------------------------------------------------------------------
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
      sid: `S-${Date.now()}`,
      role: "student",
      name: req.body.name || "Unknown",
      fname: req.body.fname || "Unknown",
      mname: req.body.mname || "",
      lname: req.body.lname || "Unknown",
      suffix: req.body.suffix || "",
      email: req.body.email || "unknown@example.com",
      password: hash,
      studentId: req.body.studentId || "",
      phone: req.body.phone || "",
      status: "active",
      lastLogin: "Not logged in.",
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
      details: `User ${mongoObject.studentId} registered successfully.`,
    };

    await db.collection("audit_db").insertOne(mongoAuditObject);

    res.json({ success: true, student: mongoObject, audit: mongoAuditObject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


//------------------------------------------------------------------------LOGOUT------------------------------------------------------------------------
userRoutes.route("/users/logout").post(verifyToken, async (req, res) => {
  let db = database.getDb();
  const studentId = req.user?.studentId;
  const user = await db.collection("student_db").findOne({ studentId });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const mongoAuditObject = {
    aid: `A-${Date.now()}`,
    action: "LOGOUT",
    targetUser: user.studentId,
    performedBy: user.studentId,
    timestamp: new Date(),
    ticketId: "",
    details: `User ${user.studentId} logged out successfully.`,
  };

  await db.collection("audit_db").insertOne(mongoAuditObject);

  await db.collection("student_db").updateOne(
      { studentId },
      { $set: { lastLogin:  new Date()} }
    );

  return res.json({ success: true, role: user.role });
});


//------------------------------------------------------------------------LOGIN------------------------------------------------------------------------
userRoutes.route("/users/login").post(async (request, response) => {
    console.log("Login route triggered for:", request.body.email);

    let db = database.getDb()
    const user = await db.collection("student_db").findOne({email: request.body.email})

    if (user){
        console.log("User found:", user.studentId);


        if (user.status && user.status.toLowerCase() === "suspended") {
          return response.status(403).json({
            success: false,
            message: "Your account has been suspended. Please contact the administrator for assistance."
          });
        }

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
                password: user.password,
                lname: user.lname,
                fname: user.fname
            }
            const token = jwt.sign(tokenPayLoad, process.env.SECRETKEY)

            const mongoAuditObject = {
                aid: `A-${Date.now()}`,
                action: "LOGIN",
                targetUser: user.studentId,
                performedBy: user.studentId,
                timestamp: new Date(),
                ticketId: "",
                details: `User ${user.studentId} logged in successfully.`,
            };

            console.log("Inserting audit record:", mongoAuditObject);

            await db.collection("audit_db").insertOne(mongoAuditObject);
            return response.json({ success: true, token, role: user.role?.toLowerCase() });
        }
        else {
            return response.json({success:false, message: "Incorrect Password"})
        }
    }
    else {
        return response.json({success: false, message: "User not found"})
    }
})


//------------------------------------------------------------------------USERS------------------------------------------------------------------------
//------------------------------------------------------------------------HOME------------------------------------------------------------------------
userRoutes.get("/home", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No student ID",
      });
    }

    
    const lostReports = await db
      .collection("lost_found_db")
      .find({ reportedBy: studentId, reportType: "Lost" })
      .toArray();

    const foundReports = await db
      .collection("lost_found_db")
      .find({ reportedBy: studentId, reportType: "Found" })
      .toArray();

   
    const claimReports = await db.collection("claims_db")
    //.find ({claimerId: studentId})
    
      .aggregate([
        {
          $match: {
            claimerId: studentId,
            claimStatus: {
              $in: ["Reviewing Claim", "Claim Approved", "Completed", "Claim Rejected", "Claim Cancelled"]
            }
          }
        },
        {
          
          $lookup: {
            from: "lost_found_db",
            localField: "selectedLostId",
            foreignField: "_id",
            as: "lostItemDetails"
          }
        },
        { $unwind: { path: "$lostItemDetails", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            title: "$lostItemDetails.title",
            category: "$lostItemDetails.category",
            keyItem: "$lostItemDetails.keyItem",
            itemBrand: "$lostItemDetails.itemBrand",
            status: "$claimStatus",
            reportType: "$lostItemDetails.reportType",
            location: "$lostItemDetails.location",
            dateReported: "$lostItemDetails.dateReported",
            dateFound: "$lostItemDetails.dateFound",
            description: "$lostItemDetails.description",
            photoUrl: "$lostItemDetails.photoUrl", 
            tid: "$lostItemDetails.tid",
            reportedBy: "$lostItemDetails.reportedBy",
            approvedBy: "$lostItemDetails.approvedBy",
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ])
        
      .toArray();

    res.json({
      success: true,
      lostReports,
      foundReports,
      claimReports,
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



userRoutes.put("/home/:id/dispose", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;
    const reportId = req.params.id;

    
    const report = await db.collection("lost_found_db").findOne({
      _id: new ObjectId(reportId),
      reportedBy: studentId,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found or not owned by you" });
    }

    // Update status to "Disposed"
    await db.collection("lost_found_db").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { status: "Deleted", updatedAt: new Date() } }
    );

    
    const audit = {
      aid: `A-${Date.now()}`,
      action: "DELETE_REPORT",
      targetUser: "",
      performedBy: studentId,
      timestamp: new Date(),
      ticketId: report.tid || "",
      details: `${studentId} deleted a report ${report.tid}.`,
    };
    await db.collection("audit_db").insertOne(audit);

    res.json({ success: true, message: "Report Deleted successfully" });
  } catch (err) {
    console.error("Error deleted report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

userRoutes.put("/home/:id/delete", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const claimId = req.params.id;
    const studentId = req.user?.studentId;

    // Find claim owned by the user
    const claim = await db.collection("claims_db").findOne({
      _id: new ObjectId(claimId),
      claimerId: studentId,
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found or not owned by you",
      });
    }

    // Soft delete → update status to "Deleted"
    await db.collection("claims_db").updateOne(
      { _id: new ObjectId(claimId) },
      { $set: { claimStatus: "Deleted", updatedAt: new Date() } }
    );

    // Add audit log
    const audit = {
      aid: `A-${Date.now()}`,
      action: "DELETE_CLAIM",
      targetUser: claim.reportedBy,
      performedBy: studentId,
      timestamp: new Date(),
      ticketId: claim.tid || "",
      details: `${studentId} deleted claim ${claim.cid}`,
    };

    await db.collection("audit_db").insertOne(audit);

    res.json({ success: true, message: "Claim deleted successfully" });
  } catch (err) {
    console.error("Delete claim error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

userRoutes.put("/home/:id/cancel", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const claimId = req.params.id;
    const studentId = req.user?.studentId;

    // Find claim owned by the user
    const claim = await db.collection("claims_db").findOne({
      _id: new ObjectId(claimId),
      claimerId: studentId,
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found or not owned by you",
      });
    }

    // Soft delete → update status to "Deleted"
    await db.collection("claims_db").updateOne(
      { _id: new ObjectId(claimId) },
      { $set: { claimStatus: "Claim Cancelled", updatedAt: new Date() } }
    );

    const updates = [];
    if (claim.selectedLostId) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.selectedLostId) },
          { $set: { status: "Listed", updatedAt: new Date() } }
        )
      );
    }
    if (claim.lostReferenceFound) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.lostReferenceFound) },
          { $set: { status: "Listed", updatedAt: new Date() } }
        )
      );
    }

    await Promise.all(updates);


    // Add audit log
    const audit = {
      aid: `A-${Date.now()}`,
      action: "CANCELLED_CLAIM",
      targetUser: claim.reportedBy,
      performedBy: studentId,
      timestamp: new Date(),
      ticketId: claim.tid || "",
      details: `${studentId} cancelled claim ${claim.cid}`,
    };

    await db.collection("audit_db").insertOne(audit);

    res.json({ success: true, message: "Claim cancelled successfully" });
  } catch (err) {
    console.error("Delete claim error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


userRoutes.get("/claim-items/:id", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const claimId = req.params.id;

    
    const claim = await db.collection("claims_db").findOne({ _id: new ObjectId(claimId) });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    
    const lostItem = claim.selectedLostId
      ? await db.collection("lost_found_db").findOne({ _id: new ObjectId(claim.selectedLostId) })
      : null;

    const foundItem = claim.lostReferenceFound
      ? await db.collection("lost_found_db").findOne({ _id: new ObjectId(claim.lostReferenceFound) })
      : null;

    // 3️⃣ Return combined data
    res.json({
      success: true,
      claim,
      lostItem,
      foundItem,
    });

  } catch (err) {
    console.error("Error fetching claim item:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching claim details.",
    });
  }
});

//------------------------------------------------------------------------REPORT------------------------------------------------------------------------
userRoutes.route("/report").post(verifyToken, upload.single("file"), async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;
    let photoUrl = req.body.photoUrl || "";

    
    //Preparing the file
    if (req.file) {
      const { originalname, buffer, mimetype } = req.file;

      const { data, error } = await supabase.storage
        .from("user_uploads")
        .upload(`report-${Date.now()}-${originalname}`, buffer, {
          contentType: mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("user_uploads")
        .getPublicUrl(data.path);

      photoUrl = publicUrlData.publicUrl;
    }

    const mongoReport = {
      tid: `T-${Date.now()}`,
      title: req.body.title || "No title",
      keyItem: req.body.keyItem || "No item",
      category: req.body.category || "No category",
      itemBrand: req.body.itemBrand || "No brand provided",
      description: req.body.description || "No description provided",
      status: "Reviewing",
      reportType: req.body.reportType,
      reportedBy: studentId,
      approvedBy: "",
      location: req.body.location || "No location provided",
      dateReported: new Date,
      dateFound: req.body.dateFound ? new Date(req.body.dateFound) : null,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      photoUrl,
      updatedAt: new Date(),
      claimedBy: ""
    };

    await db.collection("lost_found_db").insertOne(mongoReport);

    const reportType = req.body.reportType?.toLowerCase();
    const reportAuditMongo = {
      aid: `A-${Date.now()}`,
      action:
        reportType === "lost"
          ? "SUBMIT_LOST"
          : reportType === "found"
          ? "SUBMIT_FOUND"
          : "UNKNOWN",
      targetUser: "",
      performedBy: `${studentId}`,
      timestamp: new Date(),
      ticketId: mongoReport.tid,
      details:
        reportType === "lost"
          ? `${studentId} filed a lost item ${mongoReport.tid}.`
          : reportType === "found"
          ? `${studentId} filed a found item ${mongoReport.tid}.`
          : `${studentId} filed a report ${mongoReport.tid}.`,
    };

    await db.collection("audit_db").insertOne(reportAuditMongo);

    res.json({ success: true, report: mongoReport, audit: reportAuditMongo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

    

    //------------------------------------------------------------------------SETTINGS-CONTACT------------------------------------------------------------------------
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

userRoutes.delete("/settings/delete", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = new ObjectId(req.user.id); // convert to ObjectId
 
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
 
    const result = await db.collection("student_db").deleteOne({ _id: studentId });
 
    if (result.deletedCount === 0) {
      return res.status(400).json({ success: false, message: "User not found or already deleted" });
    }
 
    const audit = {
      aid: `A-${Date.now()}`,
      action: "DELETE_USER",
      targetUser: studentId,
      performedBy: studentId,
      timestamp: new Date(),
      ticketId: "",
      details: `${studentId} deleted their account.`,
    };
    await db.collection("audit_db").insertOne(audit);
 
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

userRoutes.post("/similar-items", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;

    const { selectedItemId, category, keyItem, location, startDate, endDate } = req.body;

    if (!selectedItemId || !category) {
      return res.status(400).json({ success: false, message: "Missing item info" });
    }

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);

      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ success: false, message: "Invalid date format" });
      }

      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
    }

    // Build query
    const query = {
      reportType: "Found",
      status: "Listed",
      _id: { $ne: new ObjectId(selectedItemId) },
      reportedBy: { $ne: studentId },
      category,
    };

    if (keyItem) query.keyItem = { $regex: keyItem, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (start && end) query.dateFound = { $gte: start, $lte: end };
    //Item Brand (optional)

    const similarFound = await db.collection("lost_found_db").find(query).toArray();

    res.json({ success: true, similarFound });
  } catch (err) {
    console.error("Error fetching similar items:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



//------------------------------------------------------------------------CLAIM------------------------------------------------------------------------
userRoutes.route("/claim").post(verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;
    let photoUrl = req.body.photoUrl || "";

    const { itemId, reason, selectedLostId, lostReferenceFound } = req.body;

    if (!itemId || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Upload claim photo to Supabase
    if (req.file) {
      const { originalname, buffer, mimetype } = req.file;
      const { data, error } = await supabase.storage
        .from("user_uploads")
        .upload(`claim-${Date.now()}-${originalname}`, buffer, { contentType: mimetype, upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("user_uploads")
        .getPublicUrl(data.path);

      photoUrl = publicUrlData.publicUrl;
    }

    // Create claim record
    const mongoClaim = {
      cid: `C-${Date.now()}`,
      itemId: itemId,
      claimerId: studentId,
      reason,
      adminDecisionBy: "No actions yet",
      claimStatus: "Reviewing Claim",
      createdAt: new Date(),
      photoUrl,
      selectedLostId: selectedLostId || null,
      lostReferenceFound: lostReferenceFound || null,
    };

    await db.collection("claims_db").insertOne(mongoClaim);

    // Update the original item status
    await db.collection("lost_found_db").updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { claimedBy: studentId, status: "Pending Claim" } }
    );

    // Update selectedLostId and lostReferenceFound status to "Reviewing Claim"
    const updates = [];
    if (selectedLostId) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(selectedLostId) },
          { $set: { status: "Reviewing Claim" } }
        )
      );
    }

    if (lostReferenceFound) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(lostReferenceFound) },
          { $set: { status: "Reviewing Claim" } }
        )
      );
    }

    await Promise.all(updates);

    let itemTid = itemId; // fallback to ID
    const item = await db.collection("lost_found_db").findOne({ _id: new ObjectId(itemId) });
    if (item) itemTid = item.tid || itemId;


    // Log audit
    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: "SUBMIT_CLAIM",
      performedBy: `${studentId}`,
      timestamp: new Date(),
      ticketId: mongoClaim.cid,
      details: `${studentId} filed a claim for item ${itemTid}. Claim ID: ${mongoClaim.cid}`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, claim: mongoClaim, audit: auditMongo });

  } catch (err) {
    console.error("❌ Error submitting claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = userRoutes

