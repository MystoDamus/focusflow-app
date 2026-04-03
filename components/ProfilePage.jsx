import { useState } from "react";
import { User, Mail, Edit2, Save, X, LogOut, FileUp, Download } from "lucide-react";

function ProfilePage({
  userProfile,
  onUpdateProfile,
  onLogout,
  onExportBackup,
  onImportBackup,
  importFileRef,
  subjects,
  state,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.displayName || "");
  const [editEmail, setEditEmail] = useState(userProfile?.email || "");

  const totalQuests = subjects.reduce((sum, subj) => sum + (subj.progress?.questsCleared || 0), 0);
  const totalBosses = subjects.reduce((sum, subj) => sum + (subj.progress?.bossVictories || 0), 0);
  const totalShards = subjects.reduce((sum, subj) => sum + (subj.progress?.shards || 0), 0);
  const avgLevel = Math.floor(subjects.reduce((sum, subj) => sum + (subj.progress?.level || 1), 0) / Math.max(subjects.length, 1));

  const handleSaveProfile = () => {
    if (editName.trim()) {
      onUpdateProfile({
        displayName: editName,
        email: editEmail,
      });
      setIsEditing(false);
    }
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "900px",
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "#0b0714",
    }}>
      <style>{`
        .profile-card {
          background: rgba(28, 17, 48, 0.85);
          border: 1px solid rgba(214, 176, 92, 0.25);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd36c 0%, #63c7ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin-right: 20px;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h2 {
          color: #f7ecd0;
          font-size: 24px;
          margin: 0 0 8px 0;
        }

        .profile-info p {
          color: rgba(247, 236, 208, 0.7);
          margin: 4px 0;
        }

        .profile-stat {
          display: inline-block;
          margin-right: 20px;
          margin-top: 12px;
        }

        .profile-stat strong {
          color: #ffd36c;
          display: block;
          font-size: 18px;
        }

        .profile-stat span {
          color: rgba(247, 236, 208, 0.5);
          font-size: 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          color: rgba(247, 236, 208, 0.7);
          font-size: 12px;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          background: rgba(11, 7, 20, 0.8);
          border: 1px solid rgba(214, 176, 92, 0.25);
          color: #f7ecd0;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #63c7ff;
          box-shadow: 0 0 8px rgba(99, 199, 255, 0.2);
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-accent {
          background: linear-gradient(135deg, #ffd36c 0%, #d6b05c 100%);
          color: #0b0714;
          font-weight: 600;
        }

        .btn-accent:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 211, 108, 0.3);
        }

        .btn-ghost {
          background: rgba(214, 176, 92, 0.1);
          color: #f7ecd0;
          border: 1px solid rgba(214, 176, 92, 0.25);
        }

        .btn-ghost:hover {
          background: rgba(214, 176, 92, 0.2);
        }

        .btn-danger {
          background: rgba(255, 100, 100, 0.1);
          color: #ff6464;
          border: 1px solid rgba(255, 100, 100, 0.3);
        }

        .btn-danger:hover {
          background: rgba(255, 100, 100, 0.2);
        }

        @media (max-width: 768px) {
          .profile-card {
            padding: 16px;
          }

          .profile-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
            font-size: 36px;
            margin-right: 0;
            margin-bottom: 16px;
          }

          .button-group {
            flex-wrap: wrap;
          }

          .btn {
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }

          .profile-stat {
            display: block;
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      `}</style>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              {!isEditing ? (
                <>
                  <h2>{editName || "Guild Member"}</h2>
                  <p>📧 {editEmail || "No email set"}</p>
                  <div>
                    <div className="profile-stat">
                      <strong>{avgLevel}</strong>
                      <span>Average Level</span>
                    </div>
                    <div className="profile-stat">
                      <strong>{totalQuests}</strong>
                      <span>Quests Cleared</span>
                    </div>
                    <div className="profile-stat">
                      <strong>{totalBosses}</strong>
                      <span>Bosses Defeated</span>
                    </div>
                    <div className="profile-stat">
                      <strong>{totalShards}</strong>
                      <span>Total Shards</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ marginBottom: "16px" }}>Edit Profile</h2>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your guild name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="button-group" style={{ flexDirection: "column", margintTop: 0 }}>
            {!isEditing && (
              <button className="btn btn-accent" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} />
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button className="btn btn-accent" onClick={handleSaveProfile}>
                  <Save size={16} />
                  Save
                </button>
                <button className="btn btn-ghost" onClick={() => {
                  setIsEditing(false);
                  setEditName(userProfile?.displayName || "");
                  setEditEmail(userProfile?.email || "");
                }}>
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="profile-card">
        <h3 style={{ color: "#ffd36c", marginTop: 0 }}>Achievement Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Focus Time", value: `${(state.focusMinutes || 0).toLocaleString()} min` },
            { label: "Current Streak", value: `${state.streak?.current || 0} days` },
            { label: "Longest Streak", value: `${state.streak?.longest || 0} days` },
            { label: "Prestige Level", value: `${state.prestigeLevel || 0}` },
          ].map((stat, idx) => (
            <div key={idx} style={{
              padding: "16px",
              background: "rgba(99, 199, 255, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(99, 199, 255, 0.2)",
            }}>
              <div style={{ color: "rgba(247, 236, 208, 0.7)", fontSize: "12px", marginBottom: "6px" }}>
                {stat.label}
              </div>
              <div style={{ color: "#63c7ff", fontSize: "18px", fontWeight: "bold" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="profile-card">
        <h3 style={{ color: "#ffd36c", marginTop: 0 }}>Data & Backup</h3>
        <p style={{ color: "rgba(247, 236, 208, 0.6)", marginBottom: "16px" }}>
          Export your progress or import a backup file to restore your data.
        </p>
        <div className="button-group">
          <button className="btn btn-ghost" onClick={onExportBackup}>
            <Download size={16} />
            Export Backup
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => importFileRef?.current?.click()}
          >
            <FileUp size={16} />
            Import Backup
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target?.result);
                    onImportBackup(data);
                  } catch {
                    alert("Invalid backup file");
                  }
                };
                reader.readAsText(file);
              }
            }}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="profile-card">
        <button
          className="btn btn-danger"
          onClick={onLogout}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
