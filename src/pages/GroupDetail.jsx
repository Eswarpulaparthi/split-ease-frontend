import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faUserPlus,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

const AVATAR_COLORS = [
  { bg: "#e8f0fe", text: "#1a56db" },
  { bg: "#fce8e6", text: "#d93025" },
  { bg: "#e6f4ea", text: "#137333" },
  { bg: "#fef7e0", text: "#b06000" },
  { bg: "#f3e8fd", text: "#7b1fa2" },
];

function avatarColor(id = "") {
  const safeId = typeof id === "string" && id.length > 0 ? id : "x";
  return AVATAR_COLORS[safeId.charCodeAt(0) % AVATAR_COLORS.length];
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
    month: "short",
    year: "numeric",
  });
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expensePrice, setExpensePrice] = useState("");
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [friendOptions, setFriendOptions] = useState([]);
  const [addingMemberId, setAddingMemberId] = useState(null);
  const [memberError, setMemberError] = useState("");

  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const token = localStorage.getItem("token");

  const isAdmin = group?.admin === user?.id || group?.admin?._id === user?.id;

  async function fetchGroupData() {
    setLoading(true);
    setError(false);
    try {
      const [detailsRes, settlementRes] = await Promise.all([
        fetch(`${backend_uri}/group-details/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backend_uri}/settlements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const detailsData = await detailsRes.json();
      const settlementData = await settlementRes.json();

      if (!detailsRes.ok || !detailsData.success) {
        setError(true);
        return;
      }

      setGroup(detailsData.groupDetails);
      setExpenses(detailsData.expenses || []);

      if (settlementRes.ok && settlementData.success) {
        setSettlement(settlementData);
      }
    } catch (err) {
      console.error("Failed to fetch group data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function refetchSettlement() {
    try {
      const res = await fetch(`${backend_uri}/settlements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setSettlement(data);
    } catch (err) {
      console.error("Failed to refetch settlement:", err);
    }
  }

  function openExpenseModal() {
    setExpenseTitle("");
    setExpensePrice("");
    setExpenseError("");
    setExpenseModalOpen(true);
  }

  function closeExpenseModal() {
    if (expenseSaving) return;
    setExpenseModalOpen(false);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    const title = expenseTitle.trim();
    const price = Number(expensePrice);

    if (!title) {
      setExpenseError("Please enter a title");
      return;
    }
    if (!price || price <= 0) {
      setExpenseError("Please enter a valid amount");
      return;
    }

    setExpenseSaving(true);
    setExpenseError("");
    try {
      const res = await fetch(`${backend_uri}/create-expense/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, price }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setExpenseError(data.message || "Failed to add expense");
        return;
      }

      setExpenses((prev) => [data.expense, ...prev]);
      setExpenseModalOpen(false);
      refetchSettlement();
    } catch (err) {
      console.error("Failed to add expense:", err);
      setExpenseError("Something went wrong. Please try again.");
    } finally {
      setExpenseSaving(false);
    }
  }

  async function openMemberModal() {
    setMemberError("");
    setMemberModalOpen(true);
    try {
      const res = await fetch(`${backend_uri}/api/user/${user.username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const friends = await res.json();
        const existingIds = new Set(
          (group?.members || []).map((m) => m._id ?? m),
        );
        setFriendOptions(friends.filter((f) => !existingIds.has(f._id)));
      }
    } catch (err) {
      console.error("Failed to fetch friends list:", err);
    }
  }

  function closeMemberModal() {
    setMemberModalOpen(false);
  }

  async function handleAddMember(memberId) {
    setAddingMemberId(memberId);
    setMemberError("");
    try {
      const res = await fetch(
        `${backend_uri}/group/${id}/add-member/${memberId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMemberError(data.message || "Failed to add member");
        return;
      }

      setGroup(data.updatedGroup);
      setFriendOptions((prev) => prev.filter((f) => f._id !== memberId));
    } catch (err) {
      console.error("Failed to add member:", err);
      setMemberError("Something went wrong. Please try again.");
    } finally {
      setAddingMemberId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl px-6 py-4 text-red-400 text-sm">
          Could not load this group.
        </div>
        <BackButton />
      </div>
    );
  }

  const balance = settlement?.balance ?? 0;
  const isOwed = balance >= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {group.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {group.members?.length ?? 0} member
              {group.members?.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={openMemberModal}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2 text-sm"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Add Member
              </button>
            )}
            <button
              onClick={openExpenseModal}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2 text-sm"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Expense
            </button>
          </div>
        </div>

        {/* Settlement summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <h2 className="text-2xl font-bold mt-2">
              ₹{formatMoney(settlement?.totalPrice)}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">You Paid</p>
            <h2 className="text-2xl font-bold mt-2">
              ₹{formatMoney(settlement?.userPaid)}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-sm">
              {isOwed ? "You are owed" : "You owe"}
            </p>
            <h2
              className={`text-2xl font-bold mt-2 ${isOwed ? "text-green-600" : "text-red-500"}`}
            >
              ₹{formatMoney(Math.abs(balance))}
            </h2>
          </div>
        </div>

        {/* Members */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Members</h2>
          <div className="flex flex-wrap gap-3">
            {(group.members || []).map((member) => {
              const { bg, text } = avatarColor(member._id ?? "");
              return (
                <div
                  key={member._id}
                  className="flex items-center gap-2 bg-white rounded-full pl-1.5 pr-4 py-1.5 shadow-sm"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: bg, color: text }}
                  >
                    {initials(member.username)}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    @{member.username}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Expenses */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Expenses</h2>
          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
              <FontAwesomeIcon
                icon={faReceipt}
                className="text-3xl text-gray-300 mb-2"
              />
              <p>No expenses added yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{expense.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(expense.createdAt)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{formatMoney(expense.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Expense Modal */}
      {expenseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => e.target === e.currentTarget && closeExpenseModal()}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Add an expense
              </h3>
              <button
                onClick={closeExpenseModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Dinner, Groceries"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={expensePrice}
                  onChange={(e) => setExpensePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              {expenseError && (
                <p className="text-sm text-red-500">{expenseError}</p>
              )}

              <button
                type="submit"
                disabled={expenseSaving}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition"
              >
                {expenseSaving ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {memberModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => e.target === e.currentTarget && closeMemberModal()}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Add a member
              </h3>
              <button
                onClick={closeMemberModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {memberError && (
              <p className="text-sm text-red-500 mb-3">{memberError}</p>
            )}

            <ul className="list-none m-0 p-0 max-h-[300px] overflow-y-auto space-y-1">
              {friendOptions.length === 0 && (
                <li className="text-sm text-gray-400 text-center py-6">
                  No friends available to add. Add friends first from the
                  Friends page.
                </li>
              )}
              {friendOptions.map((friend) => (
                <li
                  key={friend._id}
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold">
                      {initials(friend.username)}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      @{friend.username}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddMember(friend._id)}
                    disabled={addingMemberId === friend._id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-black/[0.12] hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-60"
                  >
                    {addingMemberId === friend._id ? "Adding..." : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
