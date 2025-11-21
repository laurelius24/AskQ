
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyCqObnat15TG88RcumaH6PdhHGWK-cC2FE",
  authDomain: "askq-96d18.firebaseapp.com",
  projectId: "askq-96d18",
  storageBucket: "askq-96d18.firebasestorage.app",
  messagingSenderId: "458114952916",
  appId: "1:458114952916:web:08e95346227c2a3aa85541"
};

let app: any = null;
let db: any = null;

try {
  // Initialize Firebase
  if (firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("Firebase initialized successfully");
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}

export { db };