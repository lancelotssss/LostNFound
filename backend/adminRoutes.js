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
});

adminRoutes.route("/lost-items").get(verifyToken, async (req, res) => {
});

adminRoutes.route("/claim-items").get(verifyToken, async (req, res) => {
});

adminRoutes.route("/logs").get(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();
    const audit = await db.collection("audit_db").find({}).toArray();

    console.log("Audit logs found:", audit.length, audit); // 👈 log results

    res.json({ success: true, results: audit });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ success: false, error: err.message });
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