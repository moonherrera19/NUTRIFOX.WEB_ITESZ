import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";

function ConvocatoriasAdmin() {
  const [convocatorias, setConvocatorias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const navigate = useNavigate();

  const obtenerConvocatorias = async () => {
    const ref = collection(FIRESTORE_DB, "convocatorias");
    const snap = await getDocs(ref);
    const datos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setConvocatorias(datos);
  };

  useEffect(() => {
    obtenerConvocatorias();
  }, []);

  const crearConvocatoria = async () => {
    if (!titulo || !fecha) return alert("Completa todos los campos.");
    try {
      await addDoc(collection(FIRESTORE_DB, "convocatorias"), {
        titulo,
        fecha: Timestamp.fromDate(new Date(fecha))
      });
      setTitulo("");
      setFecha("");
      obtenerConvocatorias();
    } catch (e) {
      console.error("Error al crear convocatoria:", e);
    }
  };

  const eliminarConvocatoria = async (id) => {
    const confirmacion = window.confirm("¿Seguro que deseas eliminar esta convocatoria?");
    if (!confirmacion) return;
    try {
      await deleteDoc(doc(FIRESTORE_DB, "convocatorias", id));
      obtenerConvocatorias();
    } catch (e) {
      console.error("Error al eliminar convocatoria:", e);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Administrar Convocatorias</h2>

        <div style={styles.formulario}>
          <input
            type="text"
            placeholder="Título de convocatoria"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={styles.input}
          />
          <button style={styles.botonCrear} onClick={crearConvocatoria}>
            Crear convocatoria
          </button>
        </div>

        <hr />
        <h3>Convocatorias existentes</h3>
        {convocatorias.length === 0 ? (
          <p>No hay convocatorias registradas.</p>
        ) : (
          convocatorias.map(c => (
            <div key={c.id} style={styles.card}>
              <p><strong>Título:</strong> {c.titulo}</p>
              <p><strong>Fecha:</strong> {c.fecha?.toDate?.().toLocaleDateString("es-MX") || "Sin fecha"}</p>
              <button style={styles.botonEliminar} onClick={() => eliminarConvocatoria(c.id)}>
                Eliminar
              </button>
            </div>
          ))
        )}

        <button style={styles.botonRegresar} onClick={() => navigate("/admin")}>Regresar</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "sans-serif"
  },
  formulario: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },
  input: {
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  botonCrear: {
    backgroundColor: "#272121",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  botonEliminar: {
    backgroundColor: "#FF0000",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: 5
  },
  card: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10
  },
  botonRegresar: {
    backgroundColor: "#443737",
    color: "white",
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    marginTop: 20,
    cursor: "pointer"
  }
};

export default ConvocatoriasAdmin;
