// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APT_KEY,
  authDomain: "nexoraai-dbc68.firebaseapp.com",
  projectId: "nexoraai-dbc68",
  storageBucket: "nexoraai-dbc68.firebasestorage.app",
  messagingSenderId: "1077503998808",
  appId: "1:1077503998808:web:f36c6e404b6050e08a032d"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()