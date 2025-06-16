import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";

function HomeAlumno() {
  const { usuario } = useContext(AuthContext);
  const [historial, setHistorial] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [yaSolicito, setYaSolicito] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(usuario?.nombre || "");
  const [nuevoCorreo, setNuevoCorreo] = useState(usuario?.correo || "");

  const puedeSolicitar =
    usuario?.estado_beca === "sin beca" || usuario?.estado_beca === "rechazado";

  useEffect(() => {
    const obtenerHistorial = async () => {
      const becasRef = collection(FIRESTORE_DB, "becas");
      const q = query(
        becasRef,
        where("numero_control", "==", usuario.numero_control),
        orderBy("fecha", "desc")
      );
      const querySnapshot = await getDocs(q);
      const datos = querySnapshot.docs.map((doc) => doc.data());
      setHistorial(datos);
    };

    const obtenerConvocatorias = async () => {
      const ref = collection(FIRESTORE_DB, "convocatorias");
      const q = query(ref, where("status", "==", "abierta"), orderBy("fecha_inicio", "desc"));
      const snap = await getDocs(q);
      const activas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConvocatorias(activas);
    };

    const verificarSolicitud = async () => {
      const docRef = doc(FIRESTORE_DB, "solicitudes", usuario.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setYaSolicito(true);
      }
    };

    if (usuario) {
      obtenerHistorial();
      obtenerConvocatorias();
      if (puedeSolicitar) verificarSolicitud();
    }
  }, [usuario, puedeSolicitar]);

  const solicitarBeca = async () => {
    try {
      await setDoc(doc(FIRESTORE_DB, "solicitudes", usuario.uid), {
        nombre: usuario.nombre,
        numero_control: usuario.numero_control,
        carrera: usuario.carrera,
        estado: "pendiente",
        fecha: new Date().toISOString()
      });
      alert("✅ Solicitud enviada correctamente.");
      setYaSolicito(true);
    } catch (e) {
      console.error("❌ Error al enviar solicitud:", e);
      alert("Hubo un error. Intenta de nuevo.");
    }
  };

  const guardarCambiosPerfil = async () => {
    try {
      const ref = doc(FIRESTORE_DB, "user", usuario.uid);
      await updateDoc(ref, {
        nombre: nuevoNombre,
        correo: nuevoCorreo
      });
      alert("✅ Perfil actualizado correctamente.");
      setMostrarModal(false);
    } catch (e) {
      console.error("❌ Error al actualizar perfil:", e);
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Bienvenido, {usuario.nombre}</h2>
        <p><strong>Número de control:</strong> {usuario.numero_control}</p>
        <p><strong>Carrera:</strong> {usuario.carrera}</p>
        <p><strong>Estado de beca:</strong> {usuario.estado_beca}</p>

        <button onClick={() => setMostrarModal(true)} style={styles.botonEditar}>
          Editar perfil
        </button>

        <hr />
        <h3>🧾 Historial de becas</h3>
        {historial.length === 0 ? (
          <p>Aún no has cobrado ninguna beca.</p>
        ) : (
          <ul>
            {historial.map((item, idx) => (
              <li key={idx}>
                {new Date(item.fecha.seconds * 1000).toLocaleDateString()} — {item.tipo || "Cobro registrado"}
              </li>
            ))}
          </ul>
        )}

        <hr />
        <h3>📢 Convocatorias disponibles</h3>
        {convocatorias.length === 0 ? (
          <p>No hay convocatorias activas en este momento.</p>
        ) : (
          convocatorias.map((conv) => (
            <div key={conv.id} style={styles.card}>
              <h4>{conv.titulo}</h4>
              <p>{conv.descripcion}</p>
              <p><strong>Vigencia:</strong> {conv.fecha_inicio} al {conv.fecha_fin}</p>
            </div>
          ))
        )}

        {puedeSolicitar && !yaSolicito && (
          <div style={{ marginTop: 20 }}>
            <button style={styles.button} onClick={solicitarBeca}>
              Solicitar ser becario
            </button>
          </div>
        )}
        {yaSolicito && (
          <p style={{ color: "orange", marginTop: 10 }}>
            Ya has enviado una solicitud pendiente.
          </p>
        )}
      </div>

      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Editar Perfil</h3>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nuevo nombre"
              style={styles.input}
            />
            <input
              type="email"
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              placeholder="Nuevo correo"
              style={styles.input}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.button} onClick={guardarCambiosPerfil}>Guardar</button>
              <button style={styles.botonCancelar} onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "sans-serif",
  },
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9"
  },
  button: {
    backgroundColor: "#FF4D00",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  botonEditar: {
    backgroundColor: "#272121",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    width: 300
  },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  botonCancelar: {
    backgroundColor: "gray",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default HomeAlumno;
