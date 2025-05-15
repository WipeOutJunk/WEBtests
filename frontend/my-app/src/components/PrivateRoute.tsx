// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store";
import type { JSX } from "react";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAppSelector(s => s.auth.token);
  return token ? children : <Navigate to="/auth" replace />;
};
