import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedLayout } from "./layouts/ProtectedLayout.jsx";
import HomePage from "./pages/Home.jsx";
import DashBoardApp from "./pages/Dashboard.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import ProfileCard from "./pages/Profile.jsx";
import SearchUser from "./pages/SearchUser.jsx";
import Groups from "./pages/Groups.jsx";

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
