import { ProtectedRoute } from "./ProtectedRoutes";
import Sidebar from "./SideBar";
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
