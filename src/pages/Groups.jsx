import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
function Groups() {
  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [adminRes, joinedRes] = await Promise.all([
          fetch(`${backend_uri}/api/admin-groups`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${backend_uri}/api/normal-groups`, {
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
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Groups
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your shared expenses
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Create Group
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Groups</p>
            <h2 className="text-3xl font-bold mt-2">{totalGroups}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">Admin Groups</p>
            <h2 className="text-3xl font-bold mt-2">{adminGroups.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">Joined Groups</p>
            <h2 className="text-3xl font-bold mt-2">{joinedGroups.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">Status</p>
            <h2 className="text-green-500 text-xl font-semibold mt-2">
              Active
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-36 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Admin Groups */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Your Groups</h2>

              {adminGroups.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-gray-500">
                  No groups created yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminGroups.map((group) => (
                    <div
                      key={group._id}
                      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{group.name}</h3>

                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                          Admin
                        </span>
                      </div>

                      <button className="mt-4 text-orange-500 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Joined Groups */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Joined Groups</h2>

              {joinedGroups.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-gray-500">
                  Not part of any groups.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {joinedGroups.map((group) => (
                    <div
                      key={group._id}
                      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-lg">{group.name}</h3>

                      <button className="mt-4 text-orange-500 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
  {
    showCreateModal && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create New Group
            </h2>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setGroupName("");
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={creating}
                onClick={createGroup}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Groups;
