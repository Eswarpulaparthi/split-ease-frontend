import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBell, faCheck } from "@fortawesome/free-solid-svg-icons";

const AVATAR_COLORS = [
  { bg: "#e8f0fe", text: "#1a56db" },
  { bg: "#fce8e6", text: "#d93025" },
  { bg: "#e6f4ea", text: "#137333" },
  { bg: "#fef7e0", text: "#b06000" },
  { bg: "#f3e8fd", text: "#7b1fa2" },
];

function avatarColor(id = "") {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name = "") {
  return name
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(iso = "") {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// GET /api/notifications normally returns a bare array, but guard against
// an error payload or a wrapped shape reaching state as a non-array.
function toNotificationsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  return [];
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;

  async function fetchNotifications() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${backend_uri}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setError(true);
        setNotifications([]);
        return;
      }

      const data = await res.json();
      setNotifications(toNotificationsArray(data));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(true);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccept(notif) {
    const notifId = notif._id;
    const friendId = notif.sender?._id ?? notif.sender;

    setActingId(notifId);
    try {
      const res = await fetch(`${backend_uri}/api/add-friend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId, notifId }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
    } catch (err) {
      console.error("Failed to accept friend request:", err);
    } finally {
      setActingId(null);
    }
  }

  // No reject/decline endpoint exists on the backend yet — this only
  // hides the request locally. Add a DELETE /api/notifications/:id (or
  // similar) route to persist a real decline.
  function handleDismiss(notifId) {
    setDismissed((prev) => new Set([...prev, notifId]));
  }

  const visibleNotifications = notifications.filter(
    (n) => !dismissed.has(n._id),
  );

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
          Notifications
        </h1>
      </header>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
          Couldn't load notifications. Try again later.
        </div>
      )}

      {!loading && !error && (
        <ul
          className="list-none mt-2 p-0 flex flex-col"
          aria-label="Notifications list"
        >
          {visibleNotifications.length === 0 && (
            <li className="flex flex-col items-center gap-2 text-gray-400 text-center py-16 px-5">
              <FontAwesomeIcon
                icon={faBell}
                className="text-2xl text-gray-200"
              />
              <span className="text-sm">No notifications</span>
            </li>
          )}

          {visibleNotifications.map((notif) => {
            const sender = notif.sender ?? {};
            const { bg, text } = avatarColor(sender._id ?? "");
            const isActing = actingId === notif._id;

            return (
              <li
                key={notif._id}
                className="flex items-center gap-3 px-5 py-3.5
                           border-b border-black/[0.05] last:border-b-0"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center
                             text-[13px] font-semibold flex-shrink-0 tracking-wide"
                  style={{ background: bg, color: text }}
                  aria-hidden="true"
                >
                  {initials(sender.username)}
                </div>

                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <span className="text-sm text-[#111] leading-snug">
                    <span className="font-semibold">
                      @{sender.username ?? "someone"}
                    </span>{" "}
                    sent you a friend request
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(notif)}
                    disabled={isActing}
                    aria-label={`Accept friend request from ${sender.username}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium
                               bg-orange-500 text-white hover:bg-orange-600
                               disabled:opacity-60 disabled:cursor-not-allowed
                               transition-colors duration-[120ms]"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>{isActing ? "..." : "Accept"}</span>
                  </button>
                  <button
                    onClick={() => handleDismiss(notif._id)}
                    disabled={isActing}
                    aria-label={`Decline friend request from ${sender.username}`}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                               border border-black/[0.12] text-gray-500
                               hover:bg-gray-100 hover:text-[#111]
                               disabled:opacity-60 disabled:cursor-not-allowed
                               transition-colors duration-[120ms]"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
