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