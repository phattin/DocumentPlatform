// app/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMTmV_1IrtdEwZD26Zib340aQx7hTqa3Y",
  authDomain: "sharing-document-platform.firebaseapp.com",
  projectId: "sharing-document-platform",
  storageBucket: "sharing-document-platform.appspot.com", // xem lưu ý bên dưới
  messagingSenderId: "654552956781",
  appId: "1:654552956781:web:9cc72ebdace3e580a3e464",
  measurementId: "G-1396NWJ20V"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// test
console.log(app.name);