import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; // Returns user object
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
