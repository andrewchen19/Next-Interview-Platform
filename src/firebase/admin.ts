import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
  const apps = getApps();

  // safety check that ensures firebase-admin is initialized only once
  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ) as string,
      }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

export const { auth, db } = initFirebaseAdmin();
