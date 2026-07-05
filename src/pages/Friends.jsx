import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faMagnifyingGlass,
  faXmark,
  faUserCheck,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

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

function formatDate(iso = "") {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Some endpoints on this API return a bare array, others wrap it in
// { friends: [...] } or { user: { friends: [...] } }. Normalize defensively
// so a shape change or an error payload never reaches .map() as a non-array.
function toFriendsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.friends)) return data.friends;
  if (Array.isArray(data?.user?.friends)) return data.user.friends;
  return [];
}

function Friends() {
  const [userFriends, setUserFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState(false);

  const [searchUserFriend, setSearchUserFriend] = useState("");
  const [searchUserFriendArr, setSearchUserFriendArr] = useState([]);
  const [query, setQuery] = useState("");
  const [queryUsers, setQueryUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requested, setRequested] = useState(new Set());

  const dialogRef = useRef(null);
  const dialogInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserFriends() {
      setFriendsLoading(true);
      setFriendsError(false);
      try {
        const res = await fetch(`${backend_uri}/api/user/${user.username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setFriendsError(true);
          setUserFriends([]);
          return;
        }

        const data = await res.json();
        const friends = toFriendsArray(data);

        if (!Array.isArray(data) && !Array.isArray(data?.friends)) {
          console.warn("Unexpected /api/user/:username response shape:", data);
        }

        setUserFriends(friends);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setFriendsError(true);
        setUserFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    }
    if (user?.username) fetchUserFriends();
  }, [user?.username]);

  useEffect(() => {
    if (!query.trim()) {
      setQueryUsers([]);
      return;
    }
    async function fetchGlobalFriends() {
      try {
        const res = await fetch(
          `${backend_uri}/api/search-suggestions/?q=${query}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setQueryUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
      }
    }
    fetchGlobalFriends();
  }, [query]);

  function handleOnChange(val) {
    setSearchUserFriend(val);
    if (val.length === 0) {
      setSearchUserFriendArr([]);
    } else {
      setSearchUserFriendArr(
        userFriends.filter((item) =>
          item.username.toLowerCase().startsWith(val.toLowerCase()),
        ),
      );
    }
  }

  const displayedFriends =
    searchUserFriend.length > 0 ? searchUserFriendArr : userFriends;

  function openDialog() {
    setDialogOpen(true);
    setQuery("");
    setQueryUsers([]);
    setTimeout(() => dialogInputRef.current?.focus(), 50);
  }

  function closeDialog() {
    setDialogOpen(false);
    setQuery("");
    setQueryUsers([]);
  }

  async function handleRequest(id) {
    try {
      const res = await fetch(`${backend_uri}/api/send-friend-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? `Request failed (${res.status})`);
      }

      setRequested((prev) => new Set([...prev, id]));
    } catch (error) {
      console.error("Failed to send friend request:", error.message);
    }
  }

  function handleBackdropClick(e) {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      closeDialog();
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeDialog();
    }
    if (dialogOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

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
          Friends
        </h1>
        <button
          onClick={openDialog}
          aria-label="Add friend"
          className="absolute right-5 flex items-center justify-center
                     text-gray-400 text-[17px] p-1 rounded-lg
                     transition-colors duration-[120ms]
                     hover:text-[#111] hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faUserPlus} />
        </button>
      </header>

      <div className="relative px-5 pt-3.5 pb-2">
        <span
          className="absolute left-[calc(1.25rem+12px)] top-1/2 -translate-y-[30%]
                         text-gray-400 text-sm flex items-center pointer-events-none"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
        <input
          type="search"
          placeholder="Search friends…"
          value={searchUserFriend}
          onChange={(e) => handleOnChange(e.target.value)}
          aria-label="Search friends"
          className="w-full py-2.5 pl-[38px] pr-3.5 rounded-xl border-none
                     bg-gray-100 text-sm text-[#111] placeholder-gray-400
                     outline-none appearance-none
                     transition-[background,box-shadow] duration-150
                     focus:bg-[#eef0f3] focus:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]
                     [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>

      {friendsLoading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      )}

      {!friendsLoading && friendsError && (
        <div className="mx-5 mt-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
          Couldn't load friends. Pull to refresh or try again later.
        </div>
      )}

      {!friendsLoading && !friendsError && (
        <ul
          className="list-none mt-2 p-0 flex flex-col"
          aria-label="Friends list"
        >
          {displayedFriends.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-12 px-5">
              {searchUserFriend
                ? `No friends found for "${searchUserFriend}"`
                : "No friends yet"}
            </li>
          )}
          {displayedFriends.map((friend) => {
            const { bg, text } = avatarColor(friend._id ?? friend.id ?? "");
            return (
              <li
                key={friend._id ?? friend.id}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer
                           border-b border-black/[0.05] last:border-b-0
                           active:bg-gray-50 md:hover:bg-gray-50
                           transition-colors duration-100"
              >
                {/* avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center
                             text-[13px] font-semibold flex-shrink-0 tracking-wide"
                  style={{ background: bg, color: text }}
                  aria-hidden="true"
                >
                  {initials(friend.name ?? friend.username)}
                </div>

                {/* info */}
                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <span className="text-[15px] font-medium text-[#111] truncate">
                    {friend.name ?? friend.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(friend.createdAt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dialogOpen && (
        <div
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Add a friend"
          className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center
                     animate-[backdropIn_0.18s_ease]
                     md:items-center"
          style={{ animation: "backdropIn 0.18s ease" }}
        >
          <style>{`
            @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
            @keyframes sheetUp    { from { transform:translateY(100%) } to { transform:translateY(0) } }
            @keyframes modalIn    { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
          `}</style>

          <div
            ref={dialogRef}
            className="bg-white w-full max-w-[480px] rounded-t-[20px] overflow-hidden
                       md:max-w-[400px] md:rounded-[20px]"
            style={{
              animation: "sheetUp 0.22s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            <div
              className="flex items-center justify-between
                            px-5 pt-4 pb-3 border-b border-black/[0.06]"
            >
              <span className="text-[15px] font-semibold text-[#111] tracking-[-0.01em]">
                Add a friend
              </span>
              <button
                onClick={closeDialog}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-sm
                           flex items-center justify-center
                           transition-colors duration-[120ms]
                           hover:bg-gray-200 hover:text-[#111]"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="relative px-5 pt-3 pb-2">
              <span
                className="absolute left-[calc(1.25rem+12px)] top-1/2 -translate-y-[30%]
                               text-gray-400 text-sm pointer-events-none flex items-center"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                ref={dialogInputRef}
                type="search"
                placeholder="Search by name or username…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users"
                className="w-full py-2.5 pl-[38px] pr-3.5 rounded-xl border-none
                           bg-gray-100 text-sm text-[#111] placeholder-gray-400
                           outline-none appearance-none
                           transition-[background,box-shadow] duration-150
                           focus:bg-[#eef0f3] focus:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]
                           [&::-webkit-search-cancel-button]:appearance-none"
              />
            </div>

            <ul
              className="list-none m-0 py-1.5 pb-3 min-h-[80px] max-h-[300px] overflow-y-auto"
              aria-label="Search results"
            >
              {query.trim().length === 0 && (
                <li className="text-[13px] text-gray-400 text-center py-6 px-5">
                  Type a name to find people
                </li>
              )}
              {query.trim().length > 0 && queryUsers.length === 0 && (
                <li className="text-[13px] text-gray-400 text-center py-6 px-5">
                  No users found for "{query}"
                </li>
              )}
              {queryUsers.map((u) => {
                const sent = requested.has(u._id ?? u.id);
                return (
                  <li
                    key={u._id ?? u.id}
                    className="flex items-center gap-3 px-5 py-2.5
                               transition-colors duration-100 hover:bg-gray-50"
                  >
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 text-gray-400
                                    flex items-center justify-center text-[15px] flex-shrink-0"
                    >
                      <FontAwesomeIcon icon={faUser} />
                    </div>

                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#111] truncate">
                        {u.name ?? u.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        @{u.username}
                      </span>
                    </div>

                    <button
                      onClick={() => !sent && handleRequest(u._id ?? u.id)}
                      disabled={sent}
                      aria-label={
                        sent
                          ? "Request sent"
                          : `Send friend request to ${u.username}`
                      }
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium",
                        "flex-shrink-0 transition-[background,color,border-color] duration-[120ms]",
                        "border border-black/[0.12]",
                        sent
                          ? "bg-green-50 text-green-600 border-green-200/60 cursor-default"
                          : "bg-white text-[#111] hover:bg-[#111] hover:text-white hover:border-[#111] cursor-pointer",
                      ].join(" ")}
                    >
                      <FontAwesomeIcon icon={sent ? faUserCheck : faUserPlus} />
                      <span>{sent ? "Sent" : "Add"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;
