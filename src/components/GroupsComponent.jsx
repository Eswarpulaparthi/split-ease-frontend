import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";

function GroupsComponent() {
  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const [adminRes, joinedRes] = await Promise.all([
        fetch(`${backend_uri}/admin-groups`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${backend_uri}/normal-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const adminData = await adminRes.json();
      const joinedData = await joinedRes.json();

      setAdminGroups(adminData.adminGroups || []);
      setJoinedGroups(joinedData.groups || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openModal() {
    setGroupName("");
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (creating) return;
    setModalOpen(false);
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) {
      setFormError("Group name is required");
      return;
    }

    setCreating(true);
    setFormError("");
    try {
      const res = await fetch(`${backend_uri}/create-group`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create group");
        return;
      }

      setAdminGroups((prev) => [data.adminGroup, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to create group:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

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
            onClick={openModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-medium transition flex items-center gap-2 justify-center"
          >
            <FontAwesomeIcon icon={faPlus} />
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

                      <p className="text-gray-400 text-xs mt-2">
                        {group.members?.length ?? 0} member
                        {group.members?.length === 1 ? "" : "s"}
                      </p>

                      <button
                        onClick={() => navigate(`/groups/${group._id}`)}
                        className="mt-4 text-orange-500 text-sm font-medium hover:text-orange-600"
                      >
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

                      <p className="text-gray-400 text-xs mt-2">
                        {group.members?.length ?? 0} member
                        {group.members?.length === 1 ? "" : "s"}
                      </p>

                      <button
                        onClick={() => navigate(`/groups/${group._id}`)}
                        className="mt-4 text-orange-500 text-sm font-medium hover:text-orange-600"
                      >
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

      {/* Create Group Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Create a group
              </h3>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Group name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Goa Trip, Roommates"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupsComponent;
