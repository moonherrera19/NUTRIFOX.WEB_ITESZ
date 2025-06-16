import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";

function SolicitudesAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState("");
  const navigate = useNavigate();

  const obtenerConvocatorias = async () => {
    const ref = collection(FIRESTORE_DB, "convocatorias");
    const snap = await getDocs(ref);
    const datos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setConvocatorias(datos);
    if (datos.length > 0) setConvocatoriaSeleccionada(datos[0].id);
  };

  const obtenerSolicitudes = async () => {
    if (!convocatoriaSeleccionada) return;
    const ref = collection(FIRESTORE_DB, "solicitudes");
    const q = query(ref, where("estado", "==", "pendiente"), where("convocatoria_id", "==", convocatoriaSeleccionada));
    const snap = await getDocs(q);
    const datos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSolicitudes(datos);
  };

  useEffect(() => {
    obtenerConvocatorias();
  }, []);

  useEffect(() => {
    obtenerSolicitudes();
  }, [convocatoriaSeleccionada]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const solicitudRef = doc(FIRESTORE_DB, "solicitudes", id);
      await updateDoc(solicitudRef, { estado: nuevoEstado });
      const solicitudSnap = await getDoc(solicitudRef);
      const data = solicitudSnap.data();
      const numeroControl = data.numero_control;

      const usuariosRef = collection(FIRESTORE_DB, "user");
      const q = query(usuariosRef, where("numero_control", "==", numeroControl));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const actualizaciones = {
          estado_beca: nuevoEstado === "aceptada" ? "becario" : "rechazado"
        };
        if (nuevoEstado === "aceptada") {
          actualizaciones.fecha_beca = Timestamp.now();
        }
        await updateDoc(doc(FIRESTORE_DB, "user", userDoc.id), actualizaciones);
      }
      obtenerSolicitudes();
    } catch (e) {
      console.error("Error al actualizar estado:", e);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Solicitudes por convocatoria</h2>

        <label>
          Convocatoria:
          <select
            value={convocatoriaSeleccionada}
            onChange={(e) => setConvocatoriaSeleccionada(e.target.value)}
            style={styles.select}
          >
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>{c.titulo}</option>
            ))}
          </select>
        </label>

        <button onClick={() => navigate("/admin")} style={styles.buttonVolver}>Regresar</button>

        <hr />

        {solicitudes.length === 0 ? (
          <p>No hay solicitudes para esta convocatoria.</p>
        ) : (
          solicitudes.map((sol) => (
            <div key={sol.id} style={styles.card}>
              <p><strong>Nombre:</strong> {sol.nombre}</p>
              <p><strong>No. Control:</strong> {sol.numero_control}</p>
              <p><strong>Carrera:</strong> {sol.carrera}</p>
              <p><strong>Fecha:</strong> {
                sol.fecha
                  ? sol.fecha.toDate?.()
                    ? sol.fecha.toDate().toLocaleDateString("es-MX")
                    : new Date(sol.fecha).toLocaleDateString("es-MX")
                  : "Sin fecha"
              }</p>
              {sol.respuestas && (
                <div>
                  <h4>Respuestas del formulario:</h4>
                  {Object.entries(sol.respuestas).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value}</p>
                  ))}
                </div>
              )}
              <div style={styles.buttons}>
                <button style={styles.buttonAceptar} onClick={() => actualizarEstado(sol.id, "aceptada")}>Aceptar</button>
                <button style={styles.buttonRechazar} onClick={() => actualizarEstado(sol.id, "rechazada")}>Rechazar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "sans-serif"
  },
  card: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15
  },
  buttons: {
    display: "flex",
    gap: 10,
    marginTop: 10
  },
  buttonAceptar: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  buttonRechazar: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  buttonVolver: {
    backgroundColor: "#444",
    color: "white",
    border: "none",
    padding: "6px 14px",
    borderRadius: "5px",
    marginLeft: 20,
    cursor: "pointer"
  },
  select: {
    padding: 5,
    marginLeft: 8,
    borderRadius: 5
  }
};

export default SolicitudesAdmin;
