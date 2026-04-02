import { useState } from "react";
import { CHARACTER_SKINS, PETS, CONSUMABLES, canAffordItem, purchaseItem } from "../shopSystem";

export default function ShopUI({ userProfile, onPurchase }) {
  const [selectedCategory, setSelectedCategory] = useState("skins");
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  const categories = [
    { id: "skins", name: "Character Skins", icon: "👤" },
    { id: "pets", name: "Pets", icon: "🐾" },
    { id: "consumables", name: "Potions", icon: "🧪" },
  ];

  const categoryContent = {
    skins: CHARACTER_SKINS,
    pets: PETS,
    consumables: CONSUMABLES,
  };

  const items = categoryContent[selectedCategory] || [];

  const handlePurchase = (item) => {
    if (item.ownable === false) return; // Can't purchase starter items

    const result = purchaseItem(item, userProfile);
    if (result.success) {
      setPurchaseSuccess(`${item.name} purchased!`);
      onPurchase(result.updatedProfile);
      setTimeout(() => setPurchaseSuccess(null), 2000);
    }
  };

  return (
    <div className="shop-ui">
      <div className="shop-header">
        <h2>🏪 Guild Shop</h2>
        <div className="currency-display">
          <span className="currency-item">
            💰 {userProfile.currency} Gold
          </span>
          <span className="currency-item">
            ✨ {userProfile.shards} Shards
          </span>
        </div>
      </div>

      <div className="shop-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {purchaseSuccess && (
        <div className="purchase-success">{purchaseSuccess}</div>
      )}

      <div className="shop-grid">
        {items.map((item) => {
          const canAfford = canAffordItem(
            item,
            userProfile.currency,
            userProfile.shards
          );
          const isOwned = userProfile.ownedItems?.includes(item.id);
          const isCurrencyShards = item.currency === "shards";

          return (
            <div key={item.id} className="shop-item">
              <div className="item-icon">
                {item.icon || (selectedCategory === "skins" ? "👤" : "🎁")}
              </div>

              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>

              <div className={`rarity-badge rarity-${item.rarity}`}>
                {item.rarity}
              </div>

              {item.bonus && (
                <div className="bonus-info">
                  {Object.entries(item.bonus).map(([key, value]) => (
                    <small key={key}>
                      +{(value * 100).toFixed(0)}% {key}
                    </small>
                  ))}
                </div>
              )}

              {item.effect && (
                <div className="effect-info">
                  <small>{item.effect.healPercent && `Restores ${item.effect.healPercent}% HP`}</small>
                  <small>{item.effect.xpMultiplier && `+${((item.effect.xpMultiplier - 1) * 100).toFixed(0)}% XP`}</small>
                </div>
              )}

              <button
                className={`purchase-btn ${isOwned ? "owned" : canAfford ? "available" : "unavailable"}`}
                onClick={() => handlePurchase(item)}
                disabled={isOwned || !canAfford || item.ownable === false}
              >
                {item.ownable === false ? (
                  "Starter Item"
                ) : isOwned ? (
                  "✓ Owned"
                ) : canAfford ? (
                  <>
                    {item.cost}{" "}
                    {isCurrencyShards ? "✨" : "💰"}
                  </>
                ) : (
                  "✗ Can't Afford"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .shop-ui {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .shop-header h2 {
          margin: 0;
          font-size: 1.8rem;
          color: #fff;
        }

        .currency-display {
          display: flex;
          gap: 20px;
        }

        .currency-item {
          padding: 8px 15px;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-weight: 600;
          color: #60a5fa;
          font-size: 0.95rem;
        }

        .shop-categories {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 10px 15px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          color: #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .category-btn:hover {
          border-color: #3b82f6;
        }

        .category-btn.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .purchase-success {
          padding: 15px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 6px;
          color: #6ee7b7;
          margin-bottom: 20px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .shop-item {
          padding: 15px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 10px;
          text-align: center;
          transition: all 0.3s;
        }

        .shop-item:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        }

        .item-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .shop-item h3 {
          margin: 8px 0;
          color: #fff;
          font-size: 1rem;
        }

        .item-description {
          margin: 6px 0;
          font-size: 0.8rem;
          color: #a0aec0;
          min-height: 40px;
          line-height: 1.3;
        }

        .rarity-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .rarity-badge.rarity-common {
          background: #6b7280;
          color: #fff;
        }

        .rarity-badge.rarity-rare {
          background: #3b82f6;
          color: #fff;
        }

        .rarity-badge.rarity-epic {
          background: #8b5cf6;
          color: #fff;
        }

        .rarity-badge.rarity-legendary {
          background: #f59e0b;
          color: #000;
        }

        .bonus-info,
        .effect-info {
          font-size: 0.75rem;
          color: #10b981;
          margin: 8px 0;
          padding: 6px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
        }

        .bonus-info small,
        .effect-info small {
          display: block;
          margin: 3px 0;
        }

        .purchase-btn {
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }

        .purchase-btn.available {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
        }

        .purchase-btn.available:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .purchase-btn.owned {
          background: #10b981;
          color: #fff;
          cursor: default;
        }

        .purchase-btn.unavailable {
          background: #6b7280;
          color: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .shop-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .currency-display {
            width: 100%;
            justify-content: space-between;
          }

          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
