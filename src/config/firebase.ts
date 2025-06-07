var admin = require("firebase-admin");

import path from 'path';
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


export const auth = admin.auth();