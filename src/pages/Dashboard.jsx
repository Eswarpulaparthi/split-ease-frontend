import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

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

function Dashboard() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const notifRef = useRef(null);

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${backend_uri}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        setNotifications(data);
        setHasUnread(data.length > 0);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
  }, [backend_uri, token]);

  const fetchSuggestions = async (q) => {
    try {
      const res = await fetch(
        `${backend_uri}/api/search-suggestions?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) return;

      setSuggestions(await res.json());
    } catch (err) {
      console.log(err);
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

        body: JSON.stringify({
          friendId: senderId,
          notifId,
        }),
      });

      if (!res.ok) return;

      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== notifId);

        setHasUnread(updated.length > 0);

        return updated;
      });
    } catch (err) {
      console.log(err);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Search */}

          <div className="relative flex-1 max-w-sm">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="
              w-full px-3 py-1.5 text-sm
              bg-gray-50 border border-gray-100
              rounded-xl outline-none
              focus:ring-2 focus:ring-orange-200
              "
            />

            {suggestions.length > 0 && (
              <div
                className="
              absolute top-full mt-2
              left-0 right-0
              bg-white rounded-xl
              shadow-xl border border-gray-100
              overflow-hidden z-50
              "
              >
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/${item.username}`}
                    className="
                  flex items-center gap-3
                  px-4 py-3
                  hover:bg-orange-50
                  "
                    onClick={() => {
                      setSuggestions([]);
                      setQuery("");
                    }}
                  >
                    <div
                      className="
                  w-8 h-8 rounded-full
                  bg-orange-100
                  flex items-center justify-center
                  text-orange-500 text-xs font-bold
                  "
                    >
                      {item.username[0].toUpperCase()}
                    </div>

                    <span className="text-sm font-medium">{item.username}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification */}

            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  setHasUnread(false);
                }}
                className="
            w-9 h-9 rounded-xl
            flex items-center justify-center
            text-gray-400
            hover:bg-gray-50
            "
              >
                <BellIcon />

                {hasUnread && (
                  <span
                    className="
              absolute top-1 right-1
              w-2 h-2 rounded-full
              bg-orange-500
              border-2 border-white
              "
                  />
                )}
              </button>

              {showNotif && (
                <div
                  className="
            absolute right-0 top-12
            w-80 bg-white
            rounded-2xl shadow-xl
            border border-gray-100
            overflow-hidden
            "
                >
                  <div
                    className="
            px-4 py-3 border-b
            text-sm font-semibold
            "
                  >
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <p
                      className="
              p-5 text-sm text-gray-400
              "
                    >
                      All caught up ✓
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className="
              flex gap-3 px-4 py-3
              border-b
              "
                      >
                        <div
                          className="
                w-8 h-8 rounded-full
                bg-orange-100
                text-orange-500
                flex items-center justify-center
                text-xs font-bold
                "
                        >
                          {n.sender.username[0].toUpperCase()}
                        </div>

                        <p className="text-xs flex-1">
                          <b>@{n.sender.username}</b>

                          {" wants to be your friend"}
                        </p>

                        <button
                          onClick={() => handleAccept(n._id, n.sender._id)}
                          className="
                bg-green-100
                text-green-600
                rounded-lg px-2
                "
                        >
                          ✓
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div
              className="
          w-9 h-9 rounded-xl
          bg-orange-500
          text-white
          flex items-center justify-center
          font-bold
          "
            >
              {initial}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}

      <main
        className="
      max-w-7xl mx-auto
      px-4 sm:px-6 py-8
      "
      >
        <div
          className="
      bg-white rounded-3xl
      border border-gray-100
      p-8 mb-8
      "
        >
          <p
            className="
        text-xs font-semibold
        text-orange-500
        uppercase tracking-widest
        "
          >
            Dashboard
          </p>

          <h1
            className="
        text-3xl font-bold
        text-gray-900 mt-2
        "
          >
            Welcome back
            {user?.username ? `, ${user.username}` : ""}
          </h1>

          <p
            className="
        text-gray-400 mt-2
        "
          >
            Track expenses, groups and settlements.
          </p>
        </div>

        <div
          className="
      grid sm:grid-cols-3 gap-4
      "
        >
          <Link
            to="/groups"
            className="
      bg-white rounded-2xl
      border border-gray-100
      p-6 hover:border-orange-200
      transition
      "
          >
            <h2 className="font-bold">Groups</h2>

            <p className="text-sm text-gray-400 mt-2">Manage your groups</p>
          </Link>

          <Link
            to="/activity"
            className="
      bg-white rounded-2xl
      border border-gray-100
      p-6 hover:border-orange-200
      transition
      "
          >
            <h2 className="font-bold">Activity</h2>

            <p className="text-sm text-gray-400 mt-2">Recent actions</p>
          </Link>

          <Link
            to="/profile"
            className="
      bg-white rounded-2xl
      border border-gray-100
      p-6 hover:border-orange-200
      transition
      "
          >
            <h2 className="font-bold">Profile</h2>

            <p className="text-sm text-gray-400 mt-2">Account settings</p>
          </Link>
        </div>

        <div
          className="
      mt-8 bg-white rounded-2xl
      border border-gray-100 p-6
      "
        >
          <h2 className="font-bold mb-2">Recent Activity</h2>

          <p className="text-sm text-gray-400">
            Expense activity will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
