import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 👈 thêm

const firebaseConfig = {
  apiKey: "AIzaSyDMTmV_1IrtdEwZD26Zib340aQx7hTqa3Y",
  authDomain: "sharing-document-platform.firebaseapp.com",
  projectId: "sharing-document-platform",
  storageBucket: "sharing-document-platform.firebasestorage.app",
  messagingSenderId: "654552956781",
  appId: "1:654552956781:web:9cc72ebdace3e580a3e464",
  measurementId: "G-1396NWJ20V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 