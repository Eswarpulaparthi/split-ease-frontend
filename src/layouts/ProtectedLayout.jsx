import { ProtectedRoute } from "./ProtectedRoutes.jsx";
import Sidebar from "./SideBar.jsx";
import { Outlet } from "react-router-dom";

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <Outlet />
      </Sidebar>
    </ProtectedRoute>
  );
}
