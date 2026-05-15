// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGULWqvYXrTOIDrqJzXZc8SFIGe1PRQfA",
  authDomain: "farkle-9d1cd.firebaseapp.com",
  projectId: "farkle-9d1cd",
  storageBucket: "farkle-9d1cd.firebasestorage.app",
  messagingSenderId: "587918580333",
  appId: "1:587918580333:web:1da2067c5d8acd4b5bbd64",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore and export it so we can use it in our components
export const db = getFirestore(app);
