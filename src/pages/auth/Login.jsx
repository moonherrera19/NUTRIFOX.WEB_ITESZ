import React, { useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import logoNutriFox from "../../assets/logo.jpeg"; // Asegúrate que este archivo esté en la carpeta correcta

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    if (usuario) {
      if (usuario.rol === "admin") {
        navigate("/admin");
      } else if (usuario.rol === "alumno") {
        navigate("/alumno");
      }
    }
  }, [usuario, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, correo, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logoNutriFox} alt="NutriFox Logo" style={styles.logo} />
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>INGRESAR</button>
        </form>
        <p style={styles.register}>
          ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #000000, #FF4D00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    width: 320,
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  logo: {
    width: 80,
    marginBottom: 10,
  },
  title: {
    marginBottom: 20,
    fontFamily: "sans-serif",
    color: "#272121"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    backgroundColor: "black",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  register: {
    marginTop: 10,
    fontSize: 14,
  },
};

export default Login;
