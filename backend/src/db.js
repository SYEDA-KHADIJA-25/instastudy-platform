/**
 * db.js — Firestore instance
 * Handles Firebase Admin initialization safely for both local and Vercel serverless.
 */
const admin = require("firebase-admin");
require("dotenv").config();

let db;

try {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "{}";
    const serviceAccount = typeof raw === "string" ? JSON.parse(raw) : raw;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();
} catch (e) {
  console.error("Firebase Admin init error:", e.message);
}

const { v4: uuidv4 } = require("uuid");

module.exports = { db, uuidv4, FieldValue: admin.firestore.FieldValue };
