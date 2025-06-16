import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function HomeAdmin() {
  const navigate = useNavigate();
  const [becasPorCarrera, setBecasPorCarrera] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState("Todas");
  const [todasCarreras, setTodasCarreras] = useState([]);

  const obtenerBecasPorCarrera = async () => {
    const ref = collection(FIRESTORE_DB, "user");
    const q = query(ref, where("estado_beca", "==", "becario"));
    const snap = await getDocs(q);
    const conteo = {};
    const setCarreras = new Set();

    snap.docs.forEach(doc => {
      let carrera = doc.data().carrera || "Sin carrera";
      carrera = carrera
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setCarreras.add(carrera);
      conteo[carrera] = (conteo[carrera] || 0) + 1;
    });

    const datos = Object.entries(conteo).map(([carrera, total]) => ({ carrera, total }));
    setBecasPorCarrera(datos);
    setTodasCarreras(["Todas", ...Array.from(setCarreras).sort()]);
  };

  useEffect(() => {
    obtenerBecasPorCarrera();
  }, []);

  const exportarPDF = async () => {
    const ref = collection(FIRESTORE_DB, "user");
    const q = query(ref, where("estado_beca", "==", "becario"));
    const snap = await getDocs(q);

    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    const rows = snap.docs
      .filter(doc => {
        const data = doc.data();
        const fecha = data.fecha_beca?.toDate?.();

        let carrera = data.carrera || "Sin carrera";
        carrera = carrera
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return fecha && fecha >= hace7dias &&
          (carreraSeleccionada === "Todas" || carrera === carreraSeleccionada);
      })
      .map(doc => {
        const data = doc.data();
        return [
          data.numero_control || "N/A",
          data.nombre || "Sin nombre",
          data.carrera || "Sin carrera",
          data.fecha_beca?.toDate?.().toLocaleDateString("es-MX") || "Sin fecha"
        ];
      });

    const docPDF = new jsPDF();
    docPDF.text("Reporte Semanal de Becas Otorgadas", 14, 15);
    autoTable(docPDF, {
      head: [["No. Control", "Nombre", "Carrera", "Fecha de beca"]],
      body: rows
    });
    docPDF.save("reporte_becas_semanal.pdf");
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.botoneraTop}>
          <button style={styles.botonSecundario} onClick={() => navigate("/admin/solicitudes")}>Solicitudes</button>
          <button style={styles.botonSecundario} onClick={() => navigate("/admin/convocatorias")}>Convocatorias</button>
        </div>

        <h3>Becas otorgadas por carrera</h3>

        <label style={{ fontWeight: "bold", marginBottom: 8 }}>
          Filtrar por carrera:{" "}
          <select
            value={carreraSeleccionada}
            onChange={(e) => setCarreraSeleccionada(e.target.value)}
            style={{ padding: 5, borderRadius: 5, marginLeft: 8 }}
          >
            {todasCarreras.map((carrera, idx) => (
              <option key={idx} value={carrera}>{carrera}</option>
            ))}
          </select>
        </label>

        {becasPorCarrera.length === 0 ? (
          <p>No hay datos suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={
                carreraSeleccionada === "Todas"
                  ? becasPorCarrera
                  : becasPorCarrera.filter(item => item.carrera === carreraSeleccionada)
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrera" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#FF4D00" />
            </BarChart>
          </ResponsiveContainer>
        )}

        <hr />
        <button style={{ ...styles.buttonAceptar, marginBottom: 20 }} onClick={exportarPDF}>
          Descargar reporte PDF semanal
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "sans-serif"
  },
  botoneraTop: {
    display: "flex",
    gap: "10px",
    marginBottom: 20
  },
  botonSecundario: {
    backgroundColor: "#272121",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  buttonAceptar: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default HomeAdmin;
