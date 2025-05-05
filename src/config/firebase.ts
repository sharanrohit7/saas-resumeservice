var admin = require("firebase-admin");

var serviceAccount = require("../../saas-job-resume-firebase-adminsdk-fbsvc-56c40615c4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


export const auth = admin.auth();