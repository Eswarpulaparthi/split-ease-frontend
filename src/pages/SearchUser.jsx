import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function SearchUser() {
  const { username } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  async function handleFriendRequest() {
    try {
      const res = await fetch(`${backend_uri}/api/send-friend-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: userInfo._id }),
      });
      if (res.ok) {
        window.history.back();
      }
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${backend_uri}/api/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log(data._id);
          setUserInfo(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-100 rounded-xl px-6 py-4 text-red-400 text-sm">
          Could not load user.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
            {userInfo?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-tight">
              @{userInfo?.username ?? "—"}
            </p>
          </div>
        </div>

        <button
          onClick={handleFriendRequest}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg w-full transition-colors"
        >
          Add Friend
        </button>

        <div className="h-px bg-gray-100" />

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
            Friends
          </p>

          <p className="text-sm text-gray-500">
            {userInfo?.friends?.length
              ? `${userInfo.friends.length} friend${userInfo.friends.length > 1 ? "s" : ""}`
              : "No friends yet."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SearchUser;
