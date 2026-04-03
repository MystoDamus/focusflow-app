import { useState } from "react";
import { ShoppingBag, User } from "lucide-react";

function AvatarShopPage({
  profile,
  petProfile,
  avatarClasses,
  hairStyles,
  outfitStyles,
  petSpecies,
  petColors,
  petAuras,
  userProfile,
  onUpdateAvatarField,
  onUpdatePetField,
  onPurchase,
}) {
  const [activeTab, setActiveTab] = useState("avatar");

  const SHOP_ITEMS = [
    { id: "cosmetic-1", name: "Holographic Aura", price: 500, type: "pet" },
    { id: "cosmetic-2", name: "Legendary Outfit", price: 750, type: "avatar" },
    { id: "cosmetic-3", name: "Crystal Pet Color", price: 300, type: "pet" },
    { id: "cosmetic-4", name: "Ancient Hair Style", price: 200, type: "avatar" },
  ];

  const userShards = userProfile?.shards ?? 0;

  return (
    <section className="feature-page avatar-shop-page">
      <div className="feature-header">
        <h2>Avatar & Shop</h2>
        <p className="muted">Customize your character and purchase cosmetics</p>
      </div>

      <div className="fc-tabs" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className={`fc-tab ${activeTab === "avatar" ? "is-active" : ""}`}
          onClick={() => setActiveTab("avatar")}
        >
          <User size={16} />
          Customize Avatar
        </button>
        <button
          type="button"
          className={`fc-tab ${activeTab === "shop" ? "is-active" : ""}`}
          onClick={() => setActiveTab("shop")}
        >
          <ShoppingBag size={16} />
          Cosmetic Shop
        </button>
      </div>

      {activeTab === "avatar" && (
        <div className="feature-grid">
          <article className="panel">
            <h3>Avatar Customization</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Class</label>
                <select 
                  value={profile?.class ?? ""} 
                  onChange={(e) => onUpdateAvatarField("class", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {avatarClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Hair Style</label>
                <select 
                  value={profile?.hairStyle ?? ""} 
                  onChange={(e) => onUpdateAvatarField("hairStyle", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {hairStyles.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Outfit</label>
                <select 
                  value={profile?.outfit ?? ""} 
                  onChange={(e) => onUpdateAvatarField("outfit", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {outfitStyles.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </article>

          <article className="panel">
            <h3>Pet Customization</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Species</label>
                <select 
                  value={petProfile?.species ?? ""} 
                  onChange={(e) => onUpdatePetField("species", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {petSpecies.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Color</label>
                <select 
                  value={petProfile?.color ?? ""} 
                  onChange={(e) => onUpdatePetField("color", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {petColors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.9rem", opacity: 0.7 }}>Aura</label>
                <select 
                  value={petProfile?.aura ?? ""} 
                  onChange={(e) => onUpdatePetField("aura", e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "rgba(11,7,20,0.6)", border: "1px solid rgba(214,176,92,0.25)", borderRadius: "8px", color: "#f7ecd0" }}
                >
                  {petAuras.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        </div>
      )}

      {activeTab === "shop" && (
        <>
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "rgba(255,211,108,0.1)", borderRadius: "8px" }}>
            <strong>Available Shards:</strong> <span style={{ color: "#63c7ff" }}>{userShards}</span> 💎
          </div>

          <div className="feature-grid">
            {SHOP_ITEMS.map((item) => (
              <article key={item.id} className="panel">
                <h4>{item.name}</h4>
                <p className="muted">{item.type === "avatar" ? "Avatar cosmetic" : "Pet cosmetic"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <strong>{item.price} 💎</strong>
                  <button 
                    className="accent-button" 
                    onClick={() => onPurchase?.(item.id)}
                    disabled={userShards < item.price}
                  >
                    Buy
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AvatarShopPage;
