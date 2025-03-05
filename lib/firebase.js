import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAkh389bUCYCaU_D0DMWtIiUltPWafAs2Y",
    authDomain: "my-blog-d974f.firebaseapp.com",
    projectId: "my-blog-d974f",
    storageBucket: "my-blog-d974f.firebasestorage.app",
    messagingSenderId: "436559343016",
    appId: "1:436559343016:web:2f493f6162fdfa7c97019d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore (Database)
const db = getFirestore(app);

// Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
 const storage = getStorage(app);


export { db, auth, googleProvider,storage };
