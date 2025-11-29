import * as admin from 'firebase-admin';

let app: admin.app.App;

// To support hot-reloading in development, we only initialize
// if there are no apps already running.
if (!admin.apps.length) {
  // When running locally, this will use the service account credentials
  // set in the GOOGLE_APPLICATION_CREDENTIALS environment variable.
  // In a deployed environment (like Cloud Run), it will automatically
  // use the runtime's service account.
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else {
  app = admin.app();
}

const auth = admin.auth();
const firestore = admin.firestore();

export function getFirebaseAdmin() {
  return { app, auth, firestore };
}
