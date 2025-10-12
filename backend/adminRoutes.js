const express = require("express");
const database = require("./connect");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });
const multer = require("multer");
const supabase = require("./supabaseClient");
const userRoutes = require("./userRoute");
const upload = multer({ storage: multer.memoryStorage() });

let adminRoutes = express.Router();
const SALT_ROUNDS = 6;

//---------------------------------------------------------------------------DASHBOARD---------------------------------------------------------------------------
adminRoutes.route("/dashboard").get(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();

    // --- COUNTING BASIC REPORTS ---
    const [
      reviewFoundCount,
      reviewLostCount,
      listedFoundCount,
      listedLostCount,
      reviewClaimsCount,
      claimReturnedCount,
      totalStorageCount, // all "Listed"
    ] = await Promise.all([
      db
        .collection("lost_found_db")
        .countDocuments({ reportType: "Found", status: "Reviewing" }),
      db
        .collection("lost_found_db")
        .countDocuments({ reportType: "Lost", status: "Reviewing" }),
      db
        .collection("lost_found_db")
        .countDocuments({ reportType: "Found", status: "Listed" }),
      db
        .collection("lost_found_db")
        .countDocuments({ reportType: "Lost", status: "Listed" }),
      db.collection("claims_db").countDocuments({ claimStatus: "Reviewing" }),
      db.collection("claims_db").countDocuments({ claimStatus: "Completed" }),
      db.collection("lost_found_db").countDocuments({ status: "Listed" }),
    ]);

    // --- RATIO LOST : FOUND ---
    const totalLost = await db
      .collection("lost_found_db")
      .countDocuments({ reportType: "Lost" });
    const totalFound = await db
      .collection("lost_found_db")
      .countDocuments({ reportType: "Found" });
    const lostToFoundRatio = totalFound
      ? `${((totalLost / totalFound) * 100).toFixed(1)}%`
      : "0%";

    // --- MOST COMMON PLACE LOST ---
    const commonPlaceAgg = await db
      .collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Lost" } },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();
    const mostCommonPlace =
      commonPlaceAgg.length > 0 ? commonPlaceAgg[0]._id : "N/A";

    // --- MOST COMMON KEY ITEM LOST ---
    const commonKeyItemAgg = await db
      .collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Lost" } },
        { $group: { _id: "$keyItem", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();
    const mostCommonKeyItem =
      commonKeyItemAgg.length > 0 ? commonKeyItemAgg[0]._id : "N/A";

    // --- WEEKLY REPORT (LAST 7 DAYS) ---
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [returnedThisWeek, receivedFoundThisWeek] = await Promise.all([
      db.collection("claims_db").countDocuments({
        claimStatus: "Completed",
        updatedAt: { $gte: oneWeekAgo },
      }),
      db.collection("lost_found_db").countDocuments({
        reportType: "Found",
        dateReported: { $gte: oneWeekAgo },
      }),
    ]);

    // --- PIE CHART DATA ---
    const pieData = [
      { name: "Listed Found", value: listedFoundCount },
      { name: "Listed Lost", value: listedLostCount },
    ];


    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const reportsToday = await db.collection("lost_found_db").find({
      dateReported: { $gte: startOfDay, $lte: endOfDay },
    })
    .sort({ dateReported: -1 })
    .toArray();

    
    const currentAdmin = req.user?.studentId || req.user?.email || req.user?.name;

    const auditLogs = await db.collection("audit_db").find({
      performedBy: currentAdmin,
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();

    // --- RESPONSE ---
    res.json({
      success: true,
      message: "Dashboard data fetched successfully.",
      statusCounts: {
        reviewFoundCount,
        listedFoundCount,
        reviewLostCount,
        listedLostCount,
        reviewClaimsCount,
        claimReturnedCount,
        totalStorageCount,
      },
      ratios: { lostToFoundRatio },
      mostCommon: {
        place: mostCommonPlace,
        keyItem: mostCommonKeyItem,
      },
      weeklyReport: {
        returnedItems: returnedThisWeek,
        receivedFoundItems: receivedFoundThisWeek,
      },
      pieChart: pieData,
      totalReports:
        reviewFoundCount +
        reviewLostCount +
        listedFoundCount +
        listedLostCount +
        reviewClaimsCount +
        claimReturnedCount,
      reportsToday,
      auditLogs,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard data.",
      error: err.message,
    });
  }
});

//---------------------------------------------------------------------------REVIEW FOUND TABLE---------------------------------------------------------------------------
adminRoutes.route("/found-items").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const foundReports = await db
      .collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Found" } },
        {
          $addFields: {
            claimStatus: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Reviewing"] }, then: 1 },
                  { case: { $eq: ["$status", "Listed"] }, then: 2 },
                  { case: { $eq: ["$status", "Reviewing Claim"] }, then: 3 },
                  { case: { $eq: ["$status", "Claim Approved"] }, then: 4 },
                  { case: { $eq: ["$status", "Returned"] }, then: 5 },
                  { case: { $eq: ["$status", "Claim Rejected"] }, then: 6 },
                  { case: { $eq: ["$status", "Denied"] }, then: 7 },
                  { case: { $eq: ["$status", "Deleted"] }, then: 8 },
                ],
                default: 99,
              },
            },
          },
        },
        { $sort: { claimStatus: 1, dateFound: 1 } },
        { $project: { claimStatus: 0 } },
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemObjectId);

    const updateResult = await db
      .collection("lost_found_db")
      .updateOne(
        { _id: objectId },
        { $set: { status, approvedBy, updatedAt: new Date() } }
      );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item = await db
      .collection("lost_found_db")
      .findOne({ _id: objectId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    if (item.claimId && ObjectId.isValid(item.claimId)) {
      await db
        .collection("claims_db")
        .updateOne(
          { _id: new ObjectId(item.claimId) },
          { $set: { adminDecisionBy: approvedBy, reviewedAt: new Date() } }
        );
    }

    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Listed" ? "APPROVE_FOUND" : "DENY_FOUND",
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

//---------------------------------------------------------------------------????---------------------------------------------------------------------------

adminRoutes.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admin only." });
    }

    const result = await db
      .collection("reports")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Admin delete error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion" });
  }
});

//---------------------------------------------------------------------------VERIFY LOST ITEMS---------------------------------------------------------------------------

adminRoutes.put("/lost/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemObjectId, status, approvedBy } = req.body;

    console.log("Incoming Lost Approve Payload:", req.body);

    if (!itemObjectId || !status || !approvedBy) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemObjectId);

    const item = await db
      .collection("lost_found_db")
      .findOne({ _id: objectId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const updateResult = await db
      .collection("lost_found_db")
      .updateOne(
        { _id: objectId, reportType: "Lost" },
        { $set: { status, approvedBy, updatedAt: new Date() } }
      );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Lost item not found" });
    }

    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Listed" ? "APPROVE_LOST" : "DENY_LOST",
      targetUser: "",
      performedBy: approvedBy,
      timestamp: new Date(),
      ticketId: item.tid,
      details: `${approvedBy} set lost item ${item.tid} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({
      success: true,
      message: `Lost Item ${status}`,
      audit: auditMongo,
    });
  } catch (err) {
    console.error("Error approving/denying lost item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

adminRoutes.route("/lost-items").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const lostReports = await db
      .collection("lost_found_db")
      .aggregate([
        { $match: { reportType: "Lost" } },
        {
          $addFields: {
            claimStatus: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Reviewing"] }, then: 1 },
                  { case: { $eq: ["$status", "Listed"] }, then: 2 },
                  { case: { $eq: ["$status", "Reviewing Claim"] }, then: 3 },
                  { case: { $eq: ["$status", "Claim Approved"] }, then: 4 },
                  { case: { $eq: ["$status", "Returned"] }, then: 5 },
                  { case: { $eq: ["$status", "Claim Rejected"] }, then: 6 },
                  { case: { $eq: ["$status", "Denied"] }, then: 7 },
                  { case: { $eq: ["$status", "Deleted"] }, then: 8 },
                ],
                default: 99,
              },
            },
          },
        },
        { $sort: { claimStatus: 1, dateLost: 1 } },
      ])
      .toArray();

    res.json({ count: lostReports.length, results: lostReports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//---------------------------------------------------------------------------HISTORY---------------------------------------------------------------------------

adminRoutes.route("/history").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const allReports = await db
      .collection("lost_found_db")
      .aggregate([
        { $match: {} },
        {
          $addFields: {
            claimStatus: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Reviewing"] }, then: 1 },
                  { case: { $eq: ["$status", "Listed"] }, then: 2 },
                  { case: { $eq: ["$status", "Denied"] }, then: 3 },
                  { case: { $eq: ["$status", "Returned"] }, then: 4 },
                  { case: { $eq: ["$status", "Reviewing Claim"] }, then: 5 },
                  { case: { $eq: ["$status", "Deleted"] }, then: 6 },
                ],
                default: 99,
              },
            },
          },
        },
        { $sort: { claimStatus: 1, dateLost: 1 } },
      ])
      .toArray();

    res.json({ count: allReports.length, results: allReports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.route("/history/delete").delete(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const studentId = req.user?.studentId;

    const deletedReports = await db
      .collection("lost_found_db")
      .find({ status: "Deleted" })
      .project({ cid: 1 })
      .toArray();

    const result = await db.collection("lost_found_db").deleteMany({
      status: "Deleted"
    });

    if (deletedReports.length > 0) {
      const audit = {
        aid: `A-${Date.now()}`,
        action: "DELETE_REPORT",
        targetUser: "",
        performedBy: studentId,
        timestamp: new Date(),
        ticketId: deletedReports.map(r => r.cid).join(", "), 
        details: `${studentId} deleted ${deletedReports.length} report(s): ${deletedReports.map(r => r.cid).join(", ")}`,
      };
      await db.collection("audit_db").insertOne(audit);
    }

    res.json({
      success: true,
      message: `${result.deletedCount} deleted history record(s) removed.`,
      deletedReports: deletedReports.map(r => r.cid)
    });

  } catch (err) {
    console.error("Error deleting history:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete history.",
      error: err.message
    });
  }
});

//---------------------------------------------------------------------------REVIEW CLAIM ITEMS---------------------------------------------------------------------------

adminRoutes.get("/claim-items", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();

try {
  const claims = await db
    .collection("claims_db")
    .aggregate([

      {
        $addFields: {
          claimOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$claimStatus", "Reviewing Claim"] }, then: 1 },
                { case: { $eq: ["$claimStatus", "Claim Approved"] }, then: 2 },
                { case: { $eq: ["$claimStatus", "Completed"] }, then: 3 },
                { case: { $eq: ["$claimStatus", "Claim Rejected"] }, then: 4 },
                { case: { $eq: ["$claimStatus", "Claim Cancelled"] }, then: 5 },
                { case: { $eq: ["$claimStatus", "Claim Deleted"] }, then: 6 },
              ],
              default: 999,
            },
          },
        },
      },

      {
        $addFields: {
          createdAtDate: {
            $cond: {
              if: { $eq: [{ $type: "$createdAt" }, "string"] },
              then: { $toDate: "$createdAt" },
              else: "$createdAt",
            },
          },
        },
      },

      
      {
        $sort: { claimOrder: 1, createdAtDate: -1 },
      },
    ])
    .toArray();

  res.json({ success: true, results: claims });
} catch (err) {
  console.error("Error fetching claims:", err);
  res.status(500).json({ success: false, error: err.message, results: [] });
}
  } catch (err) {
    console.error("Error fetching claims:", err);
    res.status(500).json({ success: false, error: err.message, results: [] });
  }
});


adminRoutes.get("/claim-items/:claimId", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { claimId } = req.params;

    if (!ObjectId.isValid(claimId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid claimId" });
    }

    const claim = await db.collection("claims_db").findOne({
      _id: new ObjectId(claimId),
    });

    if (!claim) return res.json({ success: true, claim: null });

    // linked items from lost_found_db
    const lostItem = claim.selectedLostId
      ? await db
          .collection("lost_found_db")
          .findOne({ _id: new ObjectId(claim.selectedLostId) })
      : null;

    const foundItem = claim.lostReferenceFound
      ? await db
          .collection("lost_found_db")
          .findOne({ _id: new ObjectId(claim.lostReferenceFound) })
      : null;

    res.json({ success: true, claim, foundItem, lostItem });
  } catch (err) {
    console.error("Error fetching claim details:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRoutes.put("/claim-items/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { claimId, status, approvedBy } = req.body;

    if (!ObjectId.isValid(claimId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid claimId" });

    const claimObjectId = new ObjectId(claimId);

    const claim = await db
      .collection("claims_db")
      .findOne({ _id: claimObjectId });
    if (!claim)
      return res
        .status(404)
        .json({ success: false, message: "Claim not found" });

    // Update claim
    await db.collection("claims_db").updateOne(
      { _id: claimObjectId },
      {
        $set: {
          claimStatus: status,
          adminDecisionBy: approvedBy,
          reviewedAt: new Date(),
          updatedAt: new Date()
        },
      }
    );

    // Update linked lost_found_db items based on decision
    const updates = [];

    if (claim.selectedLostId) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.selectedLostId) },
          {
            $set: {
              // Lost item becomes "Claim Rejected" if claim is denied, otherwise use the claim status
              status: status === "Claim Rejected" ? "Listed" : status,
              approvedBy,
              updatedAt: new Date(),
            },
          }
        )
      );
    }

    if (claim.lostReferenceFound) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.lostReferenceFound) },
          {
            $set: {
              // Found item becomes "Listed" if claim is denied, otherwise follow claim status
              status: status === "Claim Rejected" ? "Listed" : status,
              approvedBy,
              updatedAt: new Date(),
            },
          }
        )
      );
    }

    await Promise.all(updates);
    // Add audit trail
    const audit = {
      aid: `A-${Date.now()}`,
      action: status === "Claim Approved" ? "APPROVE_CLAIM" : "DENY_CLAIM",
      performedBy: approvedBy,
      timestamp: new Date(),
      details: `${approvedBy} set claim ${claim.cid || claimId} to ${status}.`,

    };
    await db.collection("audit_db").insertOne(audit);

    res.json({ success: true, message: `Claim ${status}`, audit });
  } catch (err) {
    console.error("Error updating claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRoutes.put("/claim-items/complete", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { claimId, approvedBy } = req.body;

    if (!ObjectId.isValid(claimId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid claimId" });

    const claimObjectId = new ObjectId(claimId);

    const claim = await db
      .collection("claims_db")
      .findOne({ _id: claimObjectId });
    if (!claim)
      return res
        .status(404)
        .json({ success: false, message: "Claim not found" });

    // Update claim to Completed
    await db.collection("claims_db").updateOne(
      { _id: claimObjectId },
      {
        $set: {
          claimStatus: "Completed",
          adminDecisionBy: approvedBy,
          reviewedAt: new Date(),
          updatedAt: new Date()
        },
      }
    );

    let ticketId = "Unknown";
    if (claim.selectedLostId) {
      const lostItem = await db.collection("lost_found_db").findOne({ _id: new ObjectId(claim.selectedLostId) });
      ticketId = lostItem?.tid || ticketId;
    } else if (claim.lostReferenceFound) {
      const foundItem = await db.collection("lost_found_db").findOne({ _id: new ObjectId(claim.lostReferenceFound) });
      ticketId = foundItem?.tid || ticketId;
    }

    // Update both linked lost_found_db items to Returned
    const updates = [];

    if (claim.selectedLostId) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.selectedLostId) },
          {
            $set: {
              status: "Returned",
              approvedBy,
              updatedAt: new Date(),
            },
          }
        )
      );
    }

    if (claim.lostReferenceFound) {
      updates.push(
        db.collection("lost_found_db").updateOne(
          { _id: new ObjectId(claim.lostReferenceFound) },
          {
            $set: {
              status: "Returned",
              approvedBy,
              updatedAt: new Date(),
            },
          }
        )
      );
    }

    await Promise.all(updates);


    
    // Add audit trail
    const audit = {
      aid: `A-${Date.now()}`,
      action: "COMPLETE_CLAIM",
      performedBy: approvedBy,
      timestamp: new Date(),
      details: `${approvedBy} completed and returned claim ${ticketId}.`,
    };
    await db.collection("audit_db").insertOne(audit);

    res.json({ success: true, message: "Claim Completed", audit });
  } catch (err) {
    console.error("Error completing claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


//---------------------------------------------------------------------------STORAGE---------------------------------------------------------------------------
adminRoutes.route("/storage").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();

    const foundReports = await db.collection("lost_found_db")
      .find({ reportType: "Found", status: "Listed" }) 
      .sort({ dateFound: -1 }) 
      .toArray();

    res.json({ count: foundReports.length, results: foundReports });
  } catch (err) {
    console.error("Error in /storage route:", err);
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.post("/storage/approve", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemId, claimerId, reason, adminDecisionBy, photoUrl, lostReferenceFound } = req.body;
    

    console.log("Incoming Claim Payload:", req.body);

    if (!itemId || !claimerId || !adminDecisionBy || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields (itemId, claimerId, adminDecisionBy, reason)" 
      });
    }

    if (!ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId" });
    }

    const objectId = new ObjectId(itemId);

    // Update lost_found_db status to "Claimed"
    const updateResult = await db.collection("lost_found_db").updateOne(
      { _id: objectId },
      { $set: { status: "Returned", updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found or already claimed" });
    }

    const item = await db.collection("lost_found_db").findOne({ _id: objectId });

    // Insert claim into claims_db
    const claimMongo = {
      cid: `C-${Date.now()}`,
      itemId,
      claimerId,
      reason,
      adminDecisionBy,
      claimStatus: "Completed",
      createdAt: new Date(),
      photoUrl: photoUrl || "",
      selectedLostId: null,
      lostReferenceFound: lostReferenceFound || null,
      reviewedAt: new Date(),
    };

    await db.collection("claims_db").insertOne(claimMongo);

    // Create audit log
    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: "CLAIMED_ITEM",
      targetUser: claimerId,
      performedBy: adminDecisionBy,
      timestamp: new Date(),
      ticketId: item.tid,
      details: `${adminDecisionBy} approved claim by ${claimerId} for item ${item.tid}.`
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({ success: true, message: "Claim report created successfully", claim: claimMongo, audit: auditMongo });
  } catch (err) {
    console.error("Error creating claim report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//---------------------------------------------------------------------------AUDIT LOGS
adminRoutes.route("/logs").get(verifyToken, async (req, res) => {
  try {
    let db = database.getDb();
    const audit = await db
      .collection("audit_db")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.json({ count: audit.length, results: audit });
  } catch (err) {
    console.error("Error in /logs route:", err);
    res.status(500).json({ error: err.message });
  }
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
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const result = await db
      .collection("student_db")
      .updateOne({ studentId }, { $set: { phone, updatedAt: new Date() } });

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No changes were made" });
    }
    const reportAuditMongo = {
      aid: `A-${Date.now()}`,
      action: "UPDATE_USER",
      targetUser: "",
      performedBy: `${studentId}`,
      timestamp: new Date(),
      ticketId: "",
      details: `${studentId} changed a profile settings.`,
    };

    await db.collection("audit_db").insertOne(reportAuditMongo);
    res.json({ success: true, message: "Phone updated successfully" });
  } catch (err) {
    console.error("Error updating phone:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//------------------------------------------------------------------------REPORT ITEM------------------------------------------------------------------------------

adminRoutes.route("/report").post(verifyToken, upload.single("file"), async (req, res) => {
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
      status: "Listed",
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
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Find user
    const user = await db.collection("student_db").findOne({ studentId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db
      .collection("student_db")
      .updateOne(
        { studentId },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Password update failed" });
    }
    const reportAuditMongo = {
      aid: `A-${Date.now()}`,
      action: "UPDATE_USER",
      targetUser: "",
      performedBy: `${studentId}`,
      timestamp: new Date(),
      ticketId: "",
      details: `${studentId} changed a profile settings.`,
    };
    await db.collection("audit_db").insertOne(reportAuditMongo);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//-------------------------------------------------------------------------------------USERS--------------------------------------------------------------------

adminRoutes.route("/users").get(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();

    
    const role = req.query.role || "student";

    
    const users = await db.collection("student_db").find({ role }).toArray();

    res.json({ count: users.length, results: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


adminRoutes.put("/users/update", verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const { itemObjectId, status, approvedBy } = req.body;

    console.log("Incoming Approve Payload:", req.body);

    if (!itemObjectId || !status || !approvedBy) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!ObjectId.isValid(itemObjectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid itemObjectId" });
    }

    const objectId = new ObjectId(itemObjectId);

 
    const user = await db.collection("student_db").findOne({ _id: objectId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

  
    const updateResult = await db.collection("student_db").updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update user status" });
    }


    const auditMongo = {
      aid: `A-${Date.now()}`,
      action: status === "Active" ? "ACTIVATE_USER" : "SUSPEND_USER",
      targetUser: user.studentId,
      performedBy: approvedBy,
      timestamp: new Date(),
      details: `${approvedBy} has set the student ${user.studentId} status to ${status}.`,
    };

    await db.collection("audit_db").insertOne(auditMongo);

    res.json({
      success: true,
      message: `User ${status} successfully.`,
      audit: auditMongo,
    });
  } catch (err) {
    console.error("Error approving/denying user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


adminRoutes.route("/admin").post(async (req, res) => {
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
        return res.status(400).json({
          success: false,
          field: "email",
          message: "Email already exists",
        });
      }
      if (existingUser.studentId === req.body.studentId) {
        return res.status(400).json({
          success: false,
          field: "studentId",
          message: "Employee ID already exists",
        });
      }
    }

    // Hash password
    const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    const mongoObject = {
      sid: `S-${Date.now()}`,
      role: "admin",
      name: req.body.name || "Unknown",
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


function verifyToken(request, response, next) {
  console.log("verifyToken middleware triggered");
  const authHeaders = request.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  if (!token) {
    return response
      .status(401)
      .json({ message: "Authentication token is missing" }); //401 means you're not authenticated
  }

  jwt.verify(token, process.env.SECRETKEY, (error, user) => {
    if (error) {
      return response.status(403).json({ message: "Invalid token" }); //403 may token pero hindi valid
    }

    request.user = user;
    next();

    /*mag vvalidate muna ung verify token bago magawa ung functions, 
            pag hindi nag run hindi mag rrun ung buong code, pero pag successful
            mapupunta siya sa next() which is itutuloy niya ung function  */
  });
}


adminRoutes.post("/similar-items", verifyToken, async (req, res) => {
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
      reportedBy: studentId ,
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




module.exports = adminRoutes;
