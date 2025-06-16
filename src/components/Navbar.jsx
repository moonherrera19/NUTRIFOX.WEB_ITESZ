import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FIREBASE_AUTH } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await FIREBASE_AUTH.signOut();
    navigate("/login");
  };

  if (!usuario) return null;

  return (
    <nav style={styles.navbar}>
      <div>
        <strong>NutriFOX Web</strong> — Rol: <em>{usuario.rol}</em>
      </div>
      <div>
        {usuario.nombre} |{" "}
        <button onClick={handleLogout} style={styles.button}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#272121",
    color: "#fff",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "sans-serif",
  },
  button: {
    backgroundColor: "#FF4D00",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer",
  },
};

export default Navbar;
