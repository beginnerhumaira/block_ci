// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCL_UOecRkXZwHSjl_pDvHZIDgK3lqEzVk",
  authDomain: "blockci.firebaseapp.com",
  projectId: "blockci",
  storageBucket: "blockci.appspot.com",
  messagingSenderId: "1001252681885",
  appId: "1:1001252681885:web:7a6550d1f9c2be711f7c74",
  measurementId: "G-HFKDFLCV1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
