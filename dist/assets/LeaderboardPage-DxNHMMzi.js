import{j as e}from"./index-BoWix2zC.js";import{r as u}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";const d={GLOBAL:"global",MODE_SPECIFIC:"modeSpecific",FRIENDS:"friends",WEEKLY:"weekly",SEASONAL:"seasonal"};function i(a){return[...a].sort((r,s)=>s.score-r.score).map((r,s)=>({...r,rank:s+1}))}function h(a,o=100){return i(a).slice(0,o)}function k(a,o,r=50){const s=o.map(n=>{var l;return{...n,score:((l=n.modeScores)==null?void 0:l[a])||0}}).filter(n=>n.score>0);return i(s).slice(0,r)}function j(a,o,r){const s=o.map(c=>r[c]).filter(c=>c!==void 0),l=[r[a],...s];return i(l)}function w(a){const o=new Date,r=(o.getDay()+6)%7,s=new Date(o);s.setDate(o.getDate()-r),s.setHours(0,0,0,0);const n=a.filter(l=>new Date(l.updatedAt)>=s);return i(n)}function N(a){const o=new Date,r=new Date(o.getFullYear(),o.getMonth(),1),s=a.filter(n=>new Date(n.updatedAt)>=r);return i(s)}function y(a,o,r,s=[],n=null){switch(a){case d.GLOBAL:return h(r);case d.MODE_SPECIFIC:return k(n,r);case d.FRIENDS:return j(o,s,r);case d.WEEKLY:return w(r);case d.SEASONAL:return N(r);default:return h(r)}}function v(a){if(a%100>=11&&a%100<=13)return`${a}th`;switch(a%10){case 1:return`${a}st`;case 2:return`${a}nd`;case 3:return`${a}rd`;default:return`${a}th`}}function L(a,o){const r=a/o*100;return r<=1?{label:"🏆 Legend",color:"#ffd700"}:r<=5?{label:"👑 Mythic",color:"#ff69b4"}:r<=10?{label:"💎 Legendary",color:"#ff4500"}:r<=25?{label:"⭐ Epic",color:"#9370db"}:r<=50?{label:"🌟 Rare",color:"#3b82f6"}:{label:"📈 Rising",color:"#10b981"}}function B({userProfile:a,allLeaderboardData:o}){var x;const[r,s]=u.useState(d.GLOBAL),[n,l]=u.useState("bossBattle"),c=[{id:d.GLOBAL,name:"Global",icon:"🌍"},{id:d.MODE_SPECIFIC,name:"By Mode",icon:"⚔️"},{id:d.WEEKLY,name:"This Week",icon:"📅"}],f=[{id:"bossBattle",name:"Boss Battle"},{id:"travelling",name:"Travelling"},{id:"gathering",name:"Gathering"},{id:"focus",name:"Focus Ritual"}],b=y(r,a==null?void 0:a.userId,o,((x=a==null?void 0:a.leaderboardStats)==null?void 0:x.friends)||[],n),p=b.find(t=>t.userId===(a==null?void 0:a.userId));return e.jsxs("div",{className:"leaderboard-page",children:[e.jsxs("div",{className:"leaderboard-header",children:[e.jsx("h1",{children:"🏆 Leaderboards"}),p&&e.jsxs("div",{className:"user-rank-banner",children:[e.jsx("span",{className:"rank-text",children:"Your Global Rank:"}),e.jsx("span",{className:"rank-display",children:v(p.rank)}),e.jsxs("span",{className:"rank-score",children:[p.score," points"]})]})]}),e.jsx("div",{className:"leaderboard-tabs",children:c.map(t=>e.jsxs("button",{className:`tab-btn ${r===t.id?"active":""}`,onClick:()=>s(t.id),children:[t.icon," ",t.name]},t.id))}),r===d.MODE_SPECIFIC&&e.jsx("div",{className:"mode-selector",children:f.map(t=>e.jsx("button",{className:`mode-btn ${n===t.id?"active":""}`,onClick:()=>l(t.id),children:t.name},t.id))}),e.jsxs("div",{className:"leaderboard-container",children:[e.jsxs("table",{className:"leaderboard-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"rank-col",children:"Rank"}),e.jsx("th",{className:"name-col",children:"Player"}),e.jsx("th",{className:"level-col",children:"Level"}),e.jsx("th",{className:"score-col",children:"Score"}),e.jsx("th",{className:"stats-col",children:"Quizzes"}),e.jsx("th",{className:"stats-col",children:"Bosses"}),e.jsx("th",{className:"streak-col",children:"Streak"})]})}),e.jsx("tbody",{children:b.slice(0,100).map((t,S)=>{const m=L(t.rank,b.length),g=t.userId===(a==null?void 0:a.userId);return e.jsxs("tr",{className:`leaderboard-row ${g?"current-user":""}`,children:[e.jsx("td",{className:"rank-col",children:e.jsx("div",{className:"rank-cell",children:e.jsx("span",{className:"rank-badge",style:{backgroundColor:m.color},title:m.label,children:t.rank})})}),e.jsx("td",{className:"name-col",children:e.jsxs("div",{className:"player-info",children:[e.jsx("strong",{children:t.displayName}),g&&e.jsx("span",{className:"you-badge",children:"You"})]})}),e.jsx("td",{className:"level-col",children:e.jsxs("span",{className:"level-display",children:["Lvl ",t.level]})}),e.jsx("td",{className:"score-col",children:e.jsx("strong",{className:"score-number",children:t.score.toLocaleString()})}),e.jsx("td",{className:"stats-col",children:t.totalQuizzesCompleted}),e.jsx("td",{className:"stats-col",children:t.totalBossesFought}),e.jsx("td",{className:"streak-col",children:e.jsx("span",{className:`streak-number ${t.currentStreak>0?"active":""}`,children:t.currentStreak})})]},t.userId)})})]}),b.length===0&&e.jsx("div",{className:"empty-state",children:e.jsx("p",{children:"No entries yet for this leaderboard"})})]}),e.jsx("style",{jsx:!0,children:`
        .leaderboard-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .leaderboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .leaderboard-header h1 {
          margin: 0 0 15px 0;
          font-size: 2rem;
          color: #fff;
        }

        .user-rank-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(245, 158, 11, 0.1);
          border: 2px solid #f59e0b;
          border-radius: 8px;
          color: #fbbf24;
        }

        .rank-text {
          font-size: 0.95rem;
        }

        .rank-display {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .rank-score {
          font-size: 0.9rem;
          color: #fcd34d;
        }

        .leaderboard-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 10px 16px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          color: #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          border-color: #3b82f6;
        }

        .tab-btn.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          padding: 15px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 8px;
        }

        .mode-btn {
          padding: 8px 12px;
          border: 1px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          color: #a0aec0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .mode-btn:hover {
          border-color: #3b82f6;
          color: #60a5fa;
        }

        .mode-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }

        .leaderboard-container {
          overflow-x: auto;
          border: 2px solid #475569;
          border-radius: 8px;
          background: rgba(30, 30, 40, 0.8);
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .leaderboard-table thead {
          background: rgba(59, 130, 246, 0.1);
          border-bottom: 2px solid #475569;
        }

        .leaderboard-table th {
          padding: 12px;
          text-align: left;
          color: #cbd5e1;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .rank-col {
          width: 80px;
        }

        .name-col {
          min-width: 200px;
        }

        .level-col {
          width: 100px;
        }

        .score-col {
          width: 120px;
        }

        .stats-col {
          width: 90px;
        }

        .streak-col {
          width: 90px;
        }

        .leaderboard-row {
          border-bottom: 1px solid #334155;
          transition: background 0.2s;
        }

        .leaderboard-row:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .leaderboard-row.current-user {
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
        }

        .leaderboard-table td {
          padding: 12px;
          color: #e2e8f0;
        }

        .rank-cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 700;
          color: #fff;
          font-size: 0.85rem;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .player-info strong {
          color: #fff;
        }

        .you-badge {
          display: inline-block;
          padding: 2px 6px;
          background: #10b981;
          color: #fff;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .level-display {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border-radius: 4px;
          font-weight: 600;
        }

        .score-number {
          color: #60a5fa;
          font-size: 1rem;
        }

        .streak-number {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border-radius: 4px;
          font-weight: 600;
        }

        .streak-number.active {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .leaderboard-table th,
          .leaderboard-table td {
            padding: 8px 4px;
            font-size: 0.8rem;
          }

          .rank-col,
          .stats-col,
          .streak-col {
            width: auto;
          }

          .name-col {
            min-width: 150px;
          }
        }
      `})]})}export{B as default};
