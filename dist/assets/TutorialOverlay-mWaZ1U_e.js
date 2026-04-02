import{b as u,j as t}from"./index-BoWix2zC.js";import{r as p}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";function f({party:n,onComplete:l,onSkip:s}){const[e,a]=p.useState(0),o=[{id:"welcome",title:"Welcome to FocusFlow, Hero!",content:"You're about to begin an epic journey to master your studies. Let me show you around.",highlight:null},{id:"party",title:"Your Party",content:`You'll lead a brave party into battle: ${u(n)}. Each member has unique strengths and will level up independently as you complete activities.`,highlight:"party"},{id:"modes",title:"Four Epic Modes",content:"⚔️ Boss Battle - Combat with quiz questions | 🧭 Travelling - Study while exploring | 🌾 Gathering - Collect resources | 🧘 Focus Ritual - Rest and meditate",highlight:"modes"},{id:"themes",title:"Dynamic Themes",content:"Each activity mode has its own visual theme. Battle themes are aggressive, while Focus is calm and peaceful. Themes change automatically or manually.",highlight:null},{id:"currency",title:"Currency System",content:"💰 Gold is earned from activities and spent in the shop. ✨ Shards are rare and used for premium cosmetics.",highlight:null},{id:"shop",title:"Shop & Customization",content:"Visit the shop to buy character skins, pets, and potions. Customize your party to look exactly how you want.",highlight:null},{id:"leaderboards",title:"Compete Globally",content:"Climb the global leaderboards, compete with friends, or track mode-specific rankings. Show off your mastery!",highlight:null},{id:"mechanics",title:"Combat Mechanics",content:"In battles: ✓ Answer correctly to damage the boss | ✗ Wrong answers = party takes damage | Defend to reduce damage | Use potions to heal",highlight:null},{id:"ready",title:"Ready to Begin?",content:"You're all set! Your party awaits. Remember: consistency beats intensity. Complete a quest every day to build an unstoppable streak!",highlight:null}],r=o[e],d=()=>{e<o.length-1?a(e+1):l()},c=()=>{e>0&&a(e-1)};return t.jsxs("div",{className:"tutorial-overlay",children:[t.jsx("div",{className:"tutorial-background",onClick:()=>{}}),t.jsxs("div",{className:"tutorial-modal",children:[t.jsx("button",{className:"tutorial-close",onClick:s,children:"✕"}),t.jsxs("div",{className:"tutorial-content",children:[t.jsx("div",{className:"tutorial-title-area",children:t.jsx("h2",{children:r.title})}),t.jsx("div",{className:"tutorial-body",children:t.jsx("p",{children:r.content})}),t.jsxs("div",{className:"tutorial-navigation",children:[t.jsx("button",{className:"nav-btn prev-btn",onClick:c,disabled:e===0,children:"← Previous"}),t.jsxs("div",{className:"step-indicator",children:[e+1," / ",o.length]}),t.jsx("button",{className:"nav-btn next-btn",onClick:d,children:e===o.length-1?"Let's Go!":"Next →"})]}),t.jsx("div",{className:"step-dots",children:o.map((h,i)=>t.jsx("div",{className:`dot ${i===e?"active":""}`,onClick:()=>a(i)},i))})]})]}),t.jsx("style",{jsx:!0,children:`
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .tutorial-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .tutorial-modal {
          position: relative;
          z-index: 10000;
          background: linear-gradient(135deg, #1a0f2e 0%, #0d0b08 100%);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tutorial-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
          z-index: 10001;
        }

        .tutorial-close:hover {
          color: #fff;
        }

        .tutorial-content {
          padding: 40px;
        }

        .tutorial-title-area {
          margin-bottom: 20px;
        }

        .tutorial-title-area h2 {
          margin: 0;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #60a5fa, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tutorial-body {
          margin-bottom: 30px;
        }

        .tutorial-body p {
          margin: 0;
          font-size: 1rem;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .tutorial-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 10px;
        }

        .nav-btn {
          padding: 10px 16px;
          border: 1px solid #3b82f6;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          min-width: 120px;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.3);
          border-color: #60a5fa;
        }

        .nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .next-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: #fff;
        }

        .next-btn:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .step-indicator {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .step-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dot:hover {
          background: #64748b;
        }

        .dot.active {
          background: #3b82f6;
          width: 24px;
          border-radius: 5px;
        }

        @media (max-width: 600px) {
          .tutorial-modal {
            margin: 20px;
          }

          .tutorial-content {
            padding: 30px 20px;
          }

          .tutorial-title-area h2 {
            font-size: 1.2rem;
          }

          .tutorial-body p {
            font-size: 0.9rem;
          }

          .nav-btn {
            min-width: auto;
            padding: 8px 12px;
            font-size: 0.85rem;
          }
        }
      `})]})}export{f as default};
