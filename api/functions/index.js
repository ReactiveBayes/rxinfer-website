"use strict";

const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// Creates a new document with timestamp when called
exports.log_using_rxinfer = onRequest(async (req, res) => {
  try {
    // Create a new document with current timestamp
    await getFirestore()
      .collection("using-rxinfer")
      .add({ timestamp: new Date() });

    // Send back success response with the document ID
    res.json({ success: true });
  } catch (error) {
    // Log error and send error response
    console.error("Error logging session:", error);
    res.status(500).json({ success: false, error: "Failed to log usage" });
  }
});
