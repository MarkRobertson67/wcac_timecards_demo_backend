// Proprietary Software License
// Copyright (c) 2024 Mark Robertson
// See LICENSE.txt file for details.


const admin = require("firebase-admin");

const authenticateFirebaseToken = async (request, response, next) => {
  const idToken = request.headers.authorization;

  if (!idToken) {
    return response.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return response.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  authenticateFirebaseToken,
};
