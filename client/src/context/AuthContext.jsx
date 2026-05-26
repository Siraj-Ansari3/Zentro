import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import api, { setAuthToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while Firebase resolves session


  //Runs whenever Firebase auth state changes (login, logout, session restore, token refresh)
 useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
    //runs on user logout and initial load when no session exists
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

  //runs on user login and refresh of the whole website
    try {
      // 1. Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // 2. Attach to axios
      setAuthToken(token);

      // 3. Call bootstrap ONCE
      const res = await api.get("/auth/bootstrap");

      setUser(res.data.user);
    } catch (err) {
      console.error("Bootstrap failed:", err);
      setUser(null);
      setLoading(false);
    }

    setLoading(false);
  });

  return unsub;
}, []);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = () => 
    signInWithPopup(auth, googleProvider);

  const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const logOut = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signIn, signInWithGoogle, signUp, logOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use anywhere: const { user, signIn } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
