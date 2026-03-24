import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../sharing-document-platform-firebase-adminsdk-fbsvc-4304f7fd7e.json";

export const adminApp = initializeApp({
  credential: cert(serviceAccount as any),
});

export const db = getFirestore(adminApp);