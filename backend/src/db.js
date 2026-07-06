/**
 * db.js — Firestore instance (replaces MySQL pool)
 * firebase-admin is already initialised in auth.js which runs first.
 * We just export the Firestore client here.
 */
const admin = require("firebase-admin");
require("dotenv").config();

// Initialise once (auth.js may have already done it)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

// Convenience helpers that mirror the uuid v4 pattern used everywhere
const { v4: uuidv4 } = require("uuid");

module.exports = { db, uuidv4, FieldValue: admin.firestore.FieldValue };
