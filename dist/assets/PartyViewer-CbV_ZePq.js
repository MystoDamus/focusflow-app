import{g as d,a as c,j as s}from"./index-BoWix2zC.js";import{r as p}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";function v({party:t,onMemberClick:x}){const[r,l]=p.useState(null),o=d(t),n=c(t),e=r?t.find(a=>a.id===r):null;return s.jsxs("div",{className:"party-viewer",children:[s.jsxs("div",{className:"party-header",children:[s.jsx("h2",{children:"⚔️ Your Party"}),s.jsxs("div",{className:"party-stats",children:[s.jsxs("span",{className:"stat",children:["Avg Level: ",s.jsx("strong",{children:Math.round(t.reduce((a,i)=>a+i.level,0)/t.length)})]}),s.jsxs("span",{className:"stat",children:["Battle Power: ",s.jsx("strong",{children:o})]})]})]}),s.jsx("div",{className:"composition-overview",children:Object.entries(n).map(([a,i])=>s.jsxs("div",{className:"composition-item",children:[s.jsx("span",{className:`role-badge role-${a.toLowerCase()}`,children:a}),s.jsxs("span",{className:"composition-count",children:["× ",i]})]},a))}),s.jsx("div",{className:"party-grid",children:t.map(a=>s.jsxs("div",{className:`party-member-card ${r===a.id?"selected":""}`,onClick:()=>l(a.id),children:[s.jsx("div",{className:"member-avatar",children:a.class==="Scholar"?"🧙":a.class==="Strategist"?"🛡️":a.class==="Alchemist"?"⚗️":"⚙️"}),s.jsx("h3",{children:a.name}),s.jsx("p",{className:"role-text",children:a.role}),s.jsxs("div",{className:"level-badge",children:["Lvl ",a.level]}),s.jsx("div",{className:"hp-bar",children:s.jsx("div",{className:"hp-fill",style:{width:`${a.currentHp/a.maxHp*100}%`}})}),s.jsxs("p",{className:"hp-text",children:[a.currentHp,"/",a.maxHp," HP"]})]},a.id))}),e&&s.jsxs("div",{className:"member-details",children:[s.jsxs("div",{className:"details-header",children:[s.jsxs("h3",{children:[e.name," - ",e.class]}),s.jsx("button",{onClick:()=>l(null),className:"close-btn",children:"✕"})]}),s.jsxs("div",{className:"stats-grid",children:[s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"Level"}),s.jsx("span",{className:"stat-value",children:e.level})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"XP Progress"}),s.jsxs("span",{className:"stat-value",children:[e.xp,"/100"]})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"Total XP"}),s.jsx("span",{className:"stat-value",children:e.totalXp})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"Role"}),s.jsx("span",{className:"stat-value",children:e.role})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"HP"}),s.jsx("span",{className:"stat-value",children:e.hp})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"ATK"}),s.jsx("span",{className:"stat-value",children:e.atk})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"DEF"}),s.jsx("span",{className:"stat-value",children:e.def})]}),s.jsxs("div",{className:"stat-box",children:[s.jsx("span",{className:"stat-label",children:"SPD"}),s.jsx("span",{className:"stat-value",children:e.spd})]})]}),s.jsxs("div",{className:"activity-stats",children:[s.jsx("h4",{children:"Activity Statistics"}),s.jsxs("div",{className:"activity-row",children:[s.jsx("span",{children:"Boss Battles Participated:"}),s.jsx("strong",{children:e.activityStats.bossBattlesParticipated})]}),s.jsxs("div",{className:"activity-row",children:[s.jsx("span",{children:"Travelled:"}),s.jsx("strong",{children:e.activityStats.travellingSessionsCompleted})]}),s.jsxs("div",{className:"activity-row",children:[s.jsx("span",{children:"Gathering Sessions:"}),s.jsx("strong",{children:e.activityStats.gatheringSessionsCompleted})]}),s.jsxs("div",{className:"activity-row",children:[s.jsx("span",{children:"Focus Rituals:"}),s.jsx("strong",{children:e.activityStats.focusSessionsCompleted})]})]})]}),s.jsx("style",{jsx:!0,children:`
        .party-viewer {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .party-header {
          margin-bottom: 20px;
        }

        .party-header h2 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
          color: #fff;
        }

        .party-stats {
          display: flex;
          gap: 20px;
        }

        .stat {
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .stat strong {
          color: #60a5fa;
          margin-left: 5px;
        }

        .composition-overview {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .composition-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }

        .role-badge.role-mage {
          background: #8b5cf6;
        }

        .role-badge.role-tank {
          background: #ef4444;
        }

        .role-badge.role-healer {
          background: #10b981;
        }

        .role-badge.role-dps {
          background: #f59e0b;
        }

        .role-badge.role-support {
          background: #06b6d4;
        }

        .composition-count {
          color: #94a3b8;
          font-weight: 600;
        }

        .party-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .party-member-card {
          padding: 15px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .party-member-card:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        }

        .party-member-card.selected {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .member-avatar {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .party-member-card h3 {
          margin: 8px 0;
          color: #fff;
        }

        .role-text {
          margin: 4px 0 10px 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .level-badge {
          display: inline-block;
          padding: 4px 8px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .hp-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }

        .hp-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          transition: width 0.3s;
        }

        .hp-text {
          margin: 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .member-details {
          padding: 20px;
          border: 2px solid #10b981;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 10px;
          margin-top: 20px;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .details-header h3 {
          margin: 0;
          color: #fff;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.2rem;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #fff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat-box {
          padding: 10px;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid #475569;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #60a5fa;
        }

        .activity-stats {
          padding-top: 15px;
          border-top: 1px solid #475569;
        }

        .activity-stats h4 {
          margin: 0 0 10px 0;
          color: #cbd5e1;
        }

        .activity-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.9rem;
          color: #a0aec0;
        }

        .activity-row strong {
          color: #fff;
        }

        @media (max-width: 768px) {
          .party-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `})]})}export{v as default};
