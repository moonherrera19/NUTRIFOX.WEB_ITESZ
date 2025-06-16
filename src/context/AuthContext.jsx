import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../services/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const docRef = doc(FIRESTORE_DB, "user", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUsuario({ ...docSnap.data(), uid: user.uid });
          } else {
            console.warn("No se encontró el documento en Firestore");
            setUsuario(null);
          }
        } catch (e) {
          console.error("Error consultando Firestore:", e.message);
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
