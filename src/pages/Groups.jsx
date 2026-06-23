import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const GroupCard = ({ group, isAdmin, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
          <UsersIcon />
        </div>

        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>

          <p className="text-xs text-gray-500 mt-0.5">
            {group.members?.length || 0} members
          </p>
        </div>
      </div>

      {isAdmin && (
        <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          Admin
        </span>
      )}
    </div>
  </div>
);

const SectionHeader = ({ title, count }) => (
  <div className="flex items-center gap-2 mb-4">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>

    <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
      {count}
    </span>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

function Groups() {
  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [adminRes, joinedRes] = await Promise.all([
          fetch(`${backend_uri}/admin-groups`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${backend_uri}/normal-groups`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
  }, [backend_uri, token]);

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      setCreating(true);

      const res = await fetch(`${backend_uri}/create-group`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
        }),
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

  const totalGroups = adminGroups.length + joinedGroups.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>

            <p className="text-sm text-gray-500 mt-1">
              Create groups and split expenses together.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <PlusIcon />
            New Group
          </button>
        </div>

        {/* Admin Groups */}
        <SectionHeader title="Your Groups" count={adminGroups.length} />

        {loading ? (
          <p className="text-sm text-gray-400 mb-10">Loading groups...</p>
        ) : adminGroups.length === 0 ? (
          <EmptyState message="You haven't created any groups yet." />
        ) : (
          <div className="space-y-3 mb-10">
            {adminGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                isAdmin
                onClick={() => navigate(`/group/${group._id}`)}
              />
            ))}
          </div>
        )}

        {/* Joined Groups */}
        <SectionHeader title="Joined Groups" count={joinedGroups.length} />

        {joinedGroups.length === 0 ? (
          <EmptyState message="You haven't joined any groups yet." />
        ) : (
          <div className="space-y-3">
            {joinedGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onClick={() => navigate(`/group/${group._id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
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
                placeholder="e.g. Goa Trip, Flatmates..."
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  disabled={creating || !groupName.trim()}
                  onClick={createGroup}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
