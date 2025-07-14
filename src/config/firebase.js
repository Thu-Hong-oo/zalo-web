// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAWhXRdGXsOfyup38Z-B3n0IakpIc5pCLE",
    authDomain: "zalo-lite-e089d.firebaseapp.com",
    projectId: "zalo-lite-e089d",
    storageBucket: "zalo-lite-e089d.appspot.com",
    messagingSenderId: "628499683999",
    appId: "1:628499683999:web:43c65e5c3772e0c727e0aa",
    measurementId: "G-856DEY530L"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
