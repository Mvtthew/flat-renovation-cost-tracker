import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, googleProvider, database } from "../lib/firebase";

type Status = "loading" | "checkingAccess" | "authorized" | "signedOut";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "checkingAccess" : "signedOut");
    });
  }, []);

  useEffect(() => {
    if (status !== "checkingAccess") return;

    let cancelled = false;
    get(ref(database))
      .then(() => {
        if (!cancelled) setStatus("authorized");
      })
      .catch(() => {
        if (!cancelled) void signOut(auth);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return {
    user,
    ready: status === "authorized",
    signedOut: status === "signedOut",
    signInWithGoogle,
    signOutUser,
  };
}
