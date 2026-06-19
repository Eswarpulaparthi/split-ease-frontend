import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// ─── Icons (inline SVG to keep zero deps) ────────────────────────────────────
const BellIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
    <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-3" />
    <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-6" />
    <div className="h-3 bg-gray-100 rounded-full w-1/4" />
  </div>
);

// ─── Group Card ───────────────────────────────────────────────────────────────
const GroupCard = ({ group, isAdmin }) => (
  <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200 cursor-pointer">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
        <UsersIcon />
      </div>
      {isAdmin && (
        <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-orange-50 text-orange-500 font-semibold">
          <ShieldIcon /> Admin
        </span>
      )}
    </div>
    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
      {group.name}
    </h3>
    <p className="text-xs text-gray-400 mb-4">
      {group.members?.length ?? 0} members
    </p>
    <button className="flex items-center gap-1 text-xs text-orange-500 font-semibold group-hover:gap-2 transition-all">
      View details <ChevronRight />
    </button>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100">
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
      {label}
    </p>
    <p className={`text-3xl font-bold ${accent ?? "text-gray-900"}`}>{value}</p>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const { user } = useAuth();

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;

  // ── Search debounce ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) fetchSuggestions(query);
      else setSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Close notif on outside click ──
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Fetch notifications ──
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${backend_uri}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
        setHasUnread(data.length > 0);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, [backend_uri, token]);

  // ── Fetch groups ──
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [adminRes, joinedRes] = await Promise.all([
          fetch(`${backend_uri}/api/admin-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backend_uri}/api/normal-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const adminData = await adminRes.json();
        const joinedData = await joinedRes.json();
        setAdminGroups(adminData.adminGroups || []);
        setJoinedGroups(joinedData.groups || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const fetchSuggestions = async (q) => {
    try {
      const res = await fetch(
        `${backend_uri}/api/search-suggestions?q=${encodeURIComponent(q)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;
      setSuggestions(await res.json());
    } catch (err) {
      console.error("Error getting search data:", err);
    }
  };

  const handleAccept = async (notifId, senderId) => {
    try {
      const res = await fetch(`${backend_uri}/api/add-friend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: senderId, notifId }),
      });
      if (!res.ok) return;
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== notifId);
        setHasUnread(updated.length > 0);
        return updated;
      });
    } catch (err) {
      console.error("Failed to accept friend request:", err);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    try {
      setCreating(true);
      const res = await fetch(`${backend_uri}/api/create-group`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setAdminGroups((prev) => [...prev, data.adminGroup]);
      setGroupName("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const totalGroups = adminGroups.length + joinedGroups.length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              SplitEase
            </span>
          </Link>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users…"
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder:text-gray-300"
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-[calc(100%+6px)] left-0 right-0 max-h-60 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-xl z-50">
                {suggestions.map((item) => (
                  <li key={item._id}>
                    <Link
                      to={`/${item.username}`}
                      onClick={() => {
                        setQuery(item.username);
                        setSuggestions([]);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-semibold">
                        {item.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{item.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotif((v) => !v);
                  setHasUnread(false);
                }}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition ${
                  showNotif
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                <BellIcon />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotif && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[90vw] max-w-sm sm:w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-800">
                      Notifications
                    </span>
                    <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-sm text-gray-400">
                      All caught up ✓
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold flex-shrink-0">
                          {n.sender.username[0].toUpperCase()}
                        </div>
                        <p className="text-xs text-gray-700 flex-1">
                          <span className="font-semibold">
                            @{n.sender.username}
                          </span>{" "}
                          wants to be your friend
                        </p>
                        <button
                          onClick={() => handleAccept(n._id, n.sender._id)}
                          className="w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition text-sm flex items-center justify-center flex-shrink-0"
                        >
                          ✓
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                {initial}
              </div>
              <span className="hidden md:block text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                {user?.username}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">
              Overview
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              Welcome back{user?.username ? `, ${user.username}` : ""}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Here's what's happening with your groups.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all self-start sm:self-auto"
          >
            <PlusIcon /> New Group
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatCard label="Total Groups" value={totalGroups} />
          <StatCard
            label="Admin"
            value={adminGroups.length}
            accent="text-orange-500"
          />
          <StatCard label="Joined" value={joinedGroups.length} />
          <StatCard label="Status" value="Active" accent="text-green-500" />
        </div>

        {/* Groups content */}
        {loading ? (
          <>
            <SectionHeader title="Your Groups" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <SectionHeader title="Joined Groups" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Admin groups */}
            <SectionHeader title="Your Groups" count={adminGroups.length} />
            {adminGroups.length === 0 ? (
              <EmptyState
                message="You haven't created any groups yet."
                cta="Create your first group"
                onCta={() => setShowCreateModal(true)}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {adminGroups.map((g) => (
                  <GroupCard key={g._id} group={g} isAdmin />
                ))}
              </div>
            )}

            {/* Joined groups */}
            <SectionHeader title="Joined Groups" count={joinedGroups.length} />
            {joinedGroups.length === 0 ? (
              <EmptyState message="You haven't joined any groups yet." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {joinedGroups.map((g) => (
                  <GroupCard key={g._id} group={g} isAdmin={false} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Create group modal ───────────────────────────────────────────────── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setGroupName("");
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Create a group
              </h2>
              <p className="text-sm text-gray-400 mb-5">
                Give your group a name to get started.
              </p>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createGroup()}
                placeholder="e.g. Goa Trip, Flatmates…"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={creating || !groupName.trim()}
                  onClick={createGroup}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 transition"
                >
                  {creating ? "Creating…" : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, count }) => (
  <div className="flex items-center gap-2 mb-4">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    {count !== undefined && (
      <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </div>
);

const EmptyState = ({ message, cta, onCta }) => (
  <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center mb-10">
    <p className="text-sm text-gray-400 mb-3">{message}</p>
    {cta && (
      <button
        onClick={onCta}
        className="text-sm text-orange-500 font-semibold hover:underline"
      >
        {cta} →
      </button>
    )}
  </div>
);

export default Dashboard;
