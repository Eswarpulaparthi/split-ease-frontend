import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

function ProfileCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, checkAuth } = useAuth();
  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError("");
  };

  const handleEditClick = () => {
    setInputValue(user.username);
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(user.username);
    setError("");
  };

  const handleSave = async () => {
    const username = inputValue.trim().toLowerCase();
    if (!username) {
      setError("Username cannot be empty.");
      return;
    }
    if (username === user.username) {
      setIsEditing(false);
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${backend_uri}/api/update-username`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (res.status === 409) {
        setError("That username was just taken.");
        return;
      }
      if (!res.ok) throw new Error();

      await checkAuth();

      setIsEditing(false);
      setError("");
    } catch {
      setError("Failed to update username.");
    } finally {
      setSaving(false);
    }
  };

  const avatar = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf7f4" }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .card { background: #fff; border-radius: 20px; box-shadow: 0 2px 24px rgba(180,120,60,0.08), 0 1px 4px rgba(0,0,0,0.04); }
        .back-btn { color: #b86e2a; transition: all 0.18s; display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500; background:none; border:none; cursor:pointer; padding:0; }
        .back-btn:hover { color: #7c4510; transform: translateX(-3px); }
        .avatar { width:64px; height:64px; border-radius:50%; background: linear-gradient(135deg, #f5a623 0%, #c86a1a 100%); display:flex; align-items:center; justify-content:center; color:#fff; font-family:'DM Serif Display',serif; font-size:22px; letter-spacing:1px; box-shadow:0 4px 14px rgba(200,106,26,0.25); }
        .field-label { font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#b86e2a; margin-bottom:6px; }
        .username-display { background:#fdf7f0; border:1.5px solid #f0d9bb; border-radius:10px; padding:10px 14px; color:#2d1a09; font-size:14px; font-weight:500; flex:1; }
        .edit-btn { background:#fdf7f0; border:1.5px solid #f0d9bb; color:#b86e2a; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .edit-btn:hover { background:#f5e9d4; border-color:#d4904a; }
        .input-field { flex:1; border:1.5px solid #f0d9bb; border-radius:10px; padding:10px 14px; font-size:14px; font-family:'DM Sans',sans-serif; color:#2d1a09; outline:none; transition:border 0.15s; background:#fdf7f0; }
        .input-field:focus { border-color:#e88030; box-shadow:0 0 0 3px rgba(232,128,48,0.1); }
        .input-field.error { border-color:#ef4444; }
        .save-btn { background:linear-gradient(135deg,#f5a623,#c86a1a); color:#fff; border:none; border-radius:10px; padding:10px 18px; font-size:12px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.15s; white-space:nowrap; }
        .save-btn:hover { opacity:0.88; }
        .save-btn:disabled { opacity:0.5; }
        .cancel-btn { background:#f3ede7; border:none; border-radius:10px; padding:10px 14px; font-size:14px; cursor:pointer; color:#7c4510; transition:background 0.15s; }
        .cancel-btn:hover { background:#eadacb; }
        .divider { height:1px; background:#f5ece0; margin: 16px 0; }
        .meta-row { display:flex; gap:24px; }
        .meta-item { display:flex; flex-direction:column; gap:2px; }
        .meta-val { font-size:15px; font-weight:600; color:#2d1a09; }
        .meta-key { font-size:11px; color:#b89070; }
      `}</style>

      <div className="card w-full max-w-sm p-7">
        <BackButton />
        <div className="flex items-center gap-4 mt-5">
          <div className="avatar">{avatar}</div>
          <div>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                color: "#1a0e05",
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </p>
            <p style={{ fontSize: 12, color: "#b89070", marginTop: 2 }}>
              Personal Account
            </p>
          </div>
        </div>

        <div className="divider" />
        <div>
          <p className="field-label">Username</p>

          {!isEditing ? (
            <div className="flex items-center gap-2">
              <div className="username-display">@{user.username}</div>
              <button className="edit-btn" onClick={handleEditClick}>
                Edit
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="flex gap-2">
                <input
                  className={`input-field${error ? " error" : ""}`}
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={saving}
                  placeholder="new username"
                  autoFocus
                />
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  ✕
                </button>
              </div>
              {error && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 2 }}>
                  ⚠ {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
