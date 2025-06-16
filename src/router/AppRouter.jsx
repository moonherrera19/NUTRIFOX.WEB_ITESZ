import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import HomeAlumno from "../pages/alumno/HomeAlumno";
import HomeAdmin from "../pages/admin/HomeAdmin";
import SolicitudesAdmin from "../pages/admin/SolicitudesAdmin";  // ✅ Importado
import ConvocatoriasAdmin from "../pages/admin/ConvocatoriasAdmin";  // ✅ Importado
import { PrivateRoute } from "./PrivateRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/alumno"
          element={
            <PrivateRoute rolRequerido="alumno">
              <HomeAlumno />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute rolRequerido="admin">
              <HomeAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/solicitudes"
          element={
            <PrivateRoute rolRequerido="admin">
              <SolicitudesAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/convocatorias"
          element={
            <PrivateRoute rolRequerido="admin">
              <ConvocatoriasAdmin />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
