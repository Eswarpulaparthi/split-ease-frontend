import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const { user } = useAuth();
  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) fetchSuggestions(query);
      else setSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const notificationData = async () => {
      const res = await fetch(`${backend_uri}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    };
    notificationData();
  }, []);

  const handleAccept = async (notifId, senderId) => {
    const res = await fetch(`${backend_uri}/api/add-friend`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId: senderId, notifId }),
    });
    if (res.ok) {
      console.log(await res.json());
    }
  };

  async function fetchSuggestions(q) {
    try {
      const res = await fetch(`${backend_uri}/api/search-suggestions?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSuggestions(await res.json());
    } catch {
      console.log("Error getting search data");
    }
  }

  const initial = user.username[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl
                     text-gray-800 placeholder-gray-400 outline-none
                     focus:bg-white focus:border-orange-200 focus:ring-2 focus:ring-orange-50 transition"
        />
        {suggestions.length > 0 && (
          <ul
            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl
                         border border-gray-100 shadow-lg overflow-hidden z-50"
          >
            {suggestions.map((item) => (
              <Link to={`/${item.username}`}>
                <li
                  key={item._id}
                  onClick={() => {
                    setQuery(item.username);
                    setSuggestions([]);
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700
                           hover:bg-orange-50 hover:text-orange-500 cursor-pointer
                           border-b border-gray-50 last:border-0 transition"
                >
                  <div
                    className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center
                                text-orange-500 text-xs font-semibold flex-shrink-0"
                  >
                    {item.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{item.username}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotif((v) => !v);
              setHasUnread(false);
            }}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition
                        ${showNotif ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
            aria-label="Notifications"
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            )}
          </button>

          {showNotif && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white rounded-2xl
                            border border-gray-100 shadow-lg z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-800">
                  Notifications
                </span>
                <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} new
                </span>
              </div>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50
               cursor-pointer border-b border-gray-50 last:border-0 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 leading-snug">
                      <span className="font-semibold">
                        @{n.sender.username}
                      </span>{" "}
                      wants to be your friend
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {n.time ?? n.createdAt}
                    </p>
                  </div>

                  {/* ✅ Green accept button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(n._id, n.sender._id);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center
                 rounded-lg bg-green-100 text-green-600 hover:bg-green-200
                 transition"
                    aria-label="Accept friend request"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User pill */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowNotif(false);
            }}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition
                        bg-orange-50"`}
          >
            <div
              className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center
                            text-white text-sm font-bold font-[Sora]"
            >
              {initial}
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden sm:block">
              {user.username}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
