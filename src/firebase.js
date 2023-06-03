// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMyi-jik-Tg09w2kmbvhEYC9cTnpdIs0w",
  authDomain: "realtor-clone-79fd3.firebaseapp.com",
  projectId: "realtor-clone-79fd3",
  storageBucket: "realtor-clone-79fd3.appspot.com",
  messagingSenderId: "34796358914",
  appId: "1:34796358914:web:a99036df7758f09841c61b",
  measurementId: "G-44VZERM59K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db=getFirestore();