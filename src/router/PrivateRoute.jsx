import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const PrivateRoute = ({ children, rolRequerido }) => {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;

  if (!usuario) return <Navigate to="/login" />;

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/login" />;
  }

  return children;
};
