import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faCheck,
  faXmark,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext.jsx";

function initials(name = "") {
  return name
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Profile() {
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [friendsCount, setFriendsCount] = useState(null);
  const [groupsCount, setGroupsCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    if (user?.username) setUsernameInput(user.username);
  }, [user?.username]);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.username) return;
      setStatsLoading(true);
      try {
        const [friendsRes, adminRes, normalRes] = await Promise.all([
          fetch(`${backend_uri}/api/user/${user.username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backend_uri}/admin-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backend_uri}/normal-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const friendsData = friendsRes.ok ? await friendsRes.json() : [];
        const adminData = adminRes.ok ? await adminRes.json() : {};
        const normalData = normalRes.ok ? await normalRes.json() : {};

        setFriendsCount(Array.isArray(friendsData) ? friendsData.length : 0);
        const adminCount = Array.isArray(adminData.adminGroups)
          ? adminData.adminGroups.length
          : 0;
        const joinedCount = Array.isArray(normalData.groups)
          ? normalData.groups.length
          : 0;
        setGroupsCount(adminCount + joinedCount);
      } catch (err) {
        console.error("Failed to fetch profile stats:", err);
        setFriendsCount(0);
        setGroupsCount(0);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, [user?.username, backend_uri, token]);

  function startEditing() {
    setUsernameInput(user?.username ?? "");
    setSaveError("");
    setEditing(true);
  }

  function cancelEditing() {
    if (saving) return;
    setUsernameInput(user?.username ?? "");
    setSaveError("");
    setEditing(false);
  }

  async function handleSaveUsername(e) {
    e.preventDefault();
    const trimmed = usernameInput.trim();

    if (!trimmed) {
      setSaveError("Username is required");
      return;
    }
    if (trimmed === user?.username) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${backend_uri}/api/update-username`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setSaveError("That username is already taken");
        return;
      }
      if (!res.ok || !data.success) {
        setSaveError(data.message || "Failed to update username");
        return;
      }

      await checkAuth();
      setEditing(false);
    } catch (err) {
      console.error("Failed to update username:", err);
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  }

  return (
    <div
      className="flex flex-col max-w-[480px] mx-auto pb-24 min-h-screen bg-white
                    md:max-w-[420px] md:my-8 md:pb-8 md:rounded-3xl md:min-h-0
                    md:border md:border-black/[0.08] md:shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:overflow-hidden
                    xl:max-w-[460px] xl:my-12"
    >
      <header
        className="flex items-center justify-center relative
                         px-5 pt-4 pb-2 sticky top-0 bg-white z-10
                         border-b border-black/[0.06]
                         md:rounded-t-3xl"
      >
        <h1 className="text-[17px] font-semibold text-[#111] tracking-[-0.01em]">
          Profile
        </h1>
      </header>

      <div className="px-5 pt-6 pb-4 flex flex-col items-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center
                     text-xl font-semibold text-white bg-orange-500 mb-3"
        >
          {initials(user?.name ?? user?.username ?? "")}
        </div>
        <p className="text-[15px] font-semibold text-[#111]">
          {user?.name ?? user?.username}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">@{user?.username}</p>
      </div>

      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Friends</p>
          <p className="text-xl font-semibold text-[#111] mt-1">
            {statsLoading ? "—" : friendsCount}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Groups</p>
          <p className="text-xl font-semibold text-[#111] mt-1">
            {statsLoading ? "—" : groupsCount}
          </p>
        </div>
      </div>

      <div className="px-5 mb-6">
        <p className="text-xs font-medium text-gray-500 mb-1.5">Username</p>

        {!editing ? (
          <div className="flex items-center justify-between border border-black/[0.08] rounded-xl px-3.5 py-2.5">
            <span className="text-sm text-[#111]">@{user?.username}</span>
            <button
              onClick={startEditing}
              aria-label="Edit username"
              className="text-gray-400 hover:text-[#111] transition-colors px-1"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveUsername} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                           outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              />
              <button
                type="submit"
                disabled={saving}
                aria-label="Save username"
                className="w-9 h-9 flex-shrink-0 rounded-lg bg-orange-500 text-white
                           flex items-center justify-center hover:bg-orange-600
                           disabled:opacity-60 transition-colors"
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                aria-label="Cancel"
                className="w-9 h-9 flex-shrink-0 rounded-lg border border-black/[0.12] text-gray-500
                           flex items-center justify-center hover:bg-gray-100
                           disabled:opacity-60 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </form>
        )}
      </div>

      <div className="px-5 mt-auto">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     border border-red-200 text-red-500 text-sm font-medium
                     hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
