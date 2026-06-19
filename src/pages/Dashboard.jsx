import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Groups from "./Groups.jsx";

function Dashboard() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const { user } = useAuth();

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
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

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
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
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [backend_uri, token]);

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
      console.error("Failed to accept friend request:", err);
    }
  };

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

      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error getting search data:", err);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 bg-white border-b border-gray-100">
      <div className="relative flex-1 min-w-[180px] sm:min-w-[250px] max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
        />

        {suggestions.length > 0 && (
          <ul className="absolute top-[calc(100%+6px)] left-0 right-0 max-h-64 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-lg z-50">
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

      {/* Notification Bell */}
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
          🔔
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
          )}
        </button>

        {showNotif && (
          <div
            className="
    absolute top-[calc(100%+8px)]
    right-0
    w-[90vw]
    max-w-sm
    sm:w-80
    bg-white
    rounded-2xl
    border border-gray-100
    shadow-lg
    z-50
    overflow-hidden
  "
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-800">
                Notifications
              </span>

              <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-700 break-words">
                      <span className="font-semibold">
                        @{n.sender.username}
                      </span>{" "}
                      wants to be your friend
                    </p>
                  </div>

                  <button
                    onClick={() => handleAccept(n._id, n.sender._id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User */}
      <div className="relative" ref={menuRef}>
        <button className="flex items-center gap-2 rounded-xl px-2 sm:px-3 py-1.5 bg-orange-50">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            {initial}
          </div>

          <span className="hidden md:block text-sm font-semibold text-gray-800 max-w-[120px] truncate">
            {user?.username}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
