"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, logOut } from "../lib/auth";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLogin() {
  const [validEmail, setValidEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      
      if (!currentUser) {
        // No user is logged in, redirect to home
        router.push("/");
      } else if (!["gopikagopakumar0799@gmail.com", "gopikagnair018@gmail.com"].includes(currentUser.email)) {
        // Unauthorized user, redirect to home
       
        router.push("/");
      } else {
        setValidEmail(currentUser.email);
        router.push("/admin")
      }
      // setUser(currentUser);
      // if (currentUser ) {
      //   router.push("/admin"); // Redirect after login
      // }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="login-container">
      {["gopikagopakumar0799@gmail.com", "gopikagnair018@gmail.com","sachinvijayd13@gmail.com"].includes(validEmail) ? (
        <div>
           <div>
           <h3 style={{
            color:'#666',
            fontSize:"15px"
           }}>Redirecting to Admin Page</h3>
         
        </div>
        </div>
      ) :!["gopikagopakumar0799@gmail.com", "gopikagnair018@gmail.com","sachinvijayd13@gmail.com"].includes(validEmail) ? (
        <div>
           {/* <div>
           <h3 style={{
            color:'#666',
            fontSize:"15px"
           }}>Access Denied:You are not an admin.</h3>
         
        </div> */}
         <button className="login-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        </div>): (
        <button className="login-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}
