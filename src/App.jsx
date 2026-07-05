import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedLayout } from "./layouts/ProtectedLayout.jsx";
import HomePage from "./pages/Home.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import ProfileCard from "./pages/Profile.jsx";
import SearchUser from "./pages/SearchUser.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetail from "./pages/GroupDetail.jsx";
import Friends from "./pages/Friends.jsx";
import Notifications from "./pages/Notifications.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/profile" element={<ProfileCard />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
