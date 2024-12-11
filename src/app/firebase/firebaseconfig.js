
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyBVxMf0QUTmAMZpNI_fIPKViZ0yHTfsSEE",
  authDomain: "recipefinder-1a597.firebaseapp.com",
  projectId: "recipefinder-1a597",
  storageBucket: "recipefinder-1a597.firebasestorage.app",
  messagingSenderId: "427153671948",
  appId: "1:427153671948:web:08779a33f103add10e2b29"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
