"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, logOut } from "../../lib/auth";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLogin() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push("/admin"); // Redirect after login
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="login-container">
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button className="logout-btn" onClick={logOut}>
            Logout
          </button>
        </div>
      ) : (
        <button className="login-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}
