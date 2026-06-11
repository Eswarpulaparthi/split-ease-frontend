import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import HomePage from "./pages/Home";
import DashBoardApp from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import ProfileCard from "./pages/Profile";
import SearchUser from "./pages/SearchUser";
import Groups from "./pages/Groups";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashBoardApp />} />
              <Route path="/profile" element={<ProfileCard />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/:username" element={<SearchUser />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
