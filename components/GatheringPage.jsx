/**
 * Gathering Mode - Collect resources passively
 */
import { useState, useEffect } from "react";

export default function GatheringPage({ party }) {
  const [resources, setResources] = useState({ wood: 0, stone: 0, herbs: 0 });
  const [activeGatherers, setActiveGatherers] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setResources((prev) => ({
        wood: prev.wood + Math.random() * 5,
        stone: prev.stone + Math.random() * 3,
        herbs: prev.herbs + Math.random() * 2,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="activity-mode-page gathering-page">
      <div className="mode-header">
        <h2>🌾 Gathering Supplies</h2>
        <p>Harvest resources and gather for your journey</p>
      </div>

      <div className="gathering-scene">
        <div className="resource-grid">
          <div className="resource-node">
            <span className="resource-icon">🌲</span>
            <span className="resource-name">Wood</span>
            <span className="resource-amount">{Math.floor(resources.wood)}</span>
          </div>
          <div className="resource-node">
            <span className="resource-icon">🪨</span>
            <span className="resource-name">Stone</span>
            <span className="resource-amount">{Math.floor(resources.stone)}</span>
          </div>
          <div className="resource-node">
            <span className="resource-icon">🌿</span>
            <span className="resource-name">Herbs</span>
            <span className="resource-amount">{Math.floor(resources.herbs)}</span>
          </div>
        </div>

        <div className="gatherers-info">
          <p>{activeGatherers} party members gathering</p>
          <div className="gathering-animation">
            <span className="gatherer">🧑‍🌾</span>
            <span className="gatherer">🧑‍🌾</span>
            <span className="gatherer">🧑‍🌾</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gathering-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #064e3b 0%, #0f2818 100%);
          padding: 20px;
        }

        .mode-header {
          text-align: center;
          color: #10b981;
          margin-bottom: 30px;
        }

        .mode-header h2 {
          font-size: 2rem;
          margin: 0 0 10px 0;
        }

        .gathering-scene {
          text-align: center;
          margin: 30px 0;
          padding: 30px 20px;
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }

        .resource-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .resource-node {
          padding: 20px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(110, 231, 183, 0.05));
          border: 2px solid #10b981;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .resource-icon {
          font-size: 2.5rem;
        }

        .resource-name {
          font-size: 0.9rem;
          color: #cbd5e1;
          font-weight: 600;
        }

        .resource-amount {
          font-size: 1.3rem;
          color: #6ee7b7;
          font-weight: 700;
        }

        .gatherers-info {
          color: #a0aec0;
        }

        .gathering-animation {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 3rem;
          margin-top: 20px;
        }

        .gatherer {
          display: inline-block;
          animation: gather 2.5s ease-in-out infinite;
        }

        .gatherer:nth-child(1) {
          animation-delay: 0s;
        }

        .gatherer:nth-child(2) {
          animation-delay: 0.3s;
        }

        .gatherer:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes gather {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          50% { transform: translateY(-15px) rotateZ(5deg); }
        }
      `}</style>
    </div>
  );
}
