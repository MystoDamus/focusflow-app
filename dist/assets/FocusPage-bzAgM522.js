import{j as e}from"./index-BoWix2zC.js";import{r as i}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";function u({party:p,onComplete:r}){const[a,l]=i.useState(0),[s,n]=i.useState(!0),[o,d]=i.useState(5);return i.useEffect(()=>{if(!s)return;const c=setInterval(()=>{d(t=>t<=0?(n(!1),r&&r(),0):t-1)},6e4),m=setInterval(()=>{l(t=>t+1)},4e3);return()=>{clearInterval(c),clearInterval(m)}},[s,r]),e.jsxs("div",{className:"activity-mode-page focus-page",children:[e.jsxs("div",{className:"focus-container",children:[e.jsx("h1",{children:"🧘 Focus Ritual"}),e.jsx("p",{className:"focus-subtitle",children:"Take a deep breath and center yourself"}),e.jsxs("div",{className:"focus-circle",children:[e.jsx("div",{className:"breathing-orb",style:{"--breath":a%4}}),e.jsx("div",{className:"breath-label",children:e.jsxs("span",{className:"breath-instruction",children:[a%4===0&&"Breathe In...",a%4===1&&"Hold...",a%4===2&&"Breathe Out...",a%4===3&&"Rest..."]})})]}),e.jsxs("div",{className:"meditation-timer",children:[e.jsxs("span",{className:"timer-display",children:[Math.floor(o/60),":",String(o%60).padStart(2,"0")]}),e.jsx("p",{className:"timer-label",children:"Continue meditating"})]}),e.jsxs("div",{className:"party-meditating",children:[e.jsx("p",{className:"party-status",children:"Your party recovers and meditate with you"}),e.jsxs("div",{className:"meditating-party",children:[e.jsx("span",{className:"meditator",children:"🧘"}),e.jsx("span",{className:"meditator",children:"🧘"}),e.jsx("span",{className:"meditator",children:"🧘"}),e.jsx("span",{className:"meditator",children:"🧘"})]})]}),e.jsxs("div",{className:"benefits-list",children:[e.jsx("h3",{children:"Benefits"}),e.jsxs("ul",{children:[e.jsx("li",{children:"🏥 Party HP Recovery"}),e.jsx("li",{children:"✨ Stamina Restoration"}),e.jsx("li",{children:"🧠 Mental Clarity"}),e.jsx("li",{children:"💚 Party Bond +5"})]})]}),e.jsx("button",{className:"focus-end-btn",onClick:()=>n(!1),children:"End Ritual"})]}),e.jsx("style",{jsx:!0,children:`
        .focus-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #3f1d5c 0%, #1a0f2e 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .focus-container {
          max-width: 600px;
          text-align: center;
          color: #d8b4fe;
        }

        .focus-container h1 {
          font-size: 2.5rem;
          margin: 0 0 10px 0;
        }

        .focus-subtitle {
          color: #a78bfa;
          margin: 0 0 40px 0;
        }

        .focus-circle {
          position: relative;
          width: 280px;
          height: 280px;
          margin: 40px auto;
          border: 3px solid #a78bfa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.05));
        }

        .breathing-orb {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, #d8b4fe, #a78bfa);
          animation: breathe 4s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(216, 180, 254, 0.5));
        }

        @keyframes breathe {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          25% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          75% { transform: scale(1); opacity: 0.8; }
        }

        .breath-label {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
        }

        .breath-instruction {
          font-size: 1rem;
          color: #a78bfa;
          font-weight: 600;
          letter-spacing: 2px;
        }

        .meditation-timer {
          margin: 40px 0;
          padding: 20px;
          background: rgba(167, 139, 250, 0.1);
          border: 2px solid #a78bfa;
          border-radius: 10px;
        }

        .timer-display {
          display: block;
          font-size: 3rem;
          font-weight: 700;
          color: #d8b4fe;
          font-family: monospace;
        }

        .timer-label {
          margin: 10px 0 0 0;
          color: #a78bfa;
          font-size: 0.9rem;
        }

        .party-meditating {
          margin: 40px 0;
        }

        .party-status {
          color: #a78bfa;
          margin: 0 0 20px 0;
          font-weight: 600;
        }

        .meditating-party {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 3rem;
        }

        .meditator {
          display: inline-block;
          animation: meditate 3s ease-in-out infinite;
        }

        .meditator:nth-child(1) {
          animation-delay: 0s;
        }

        .meditator:nth-child(2) {
          animation-delay: 0.3s;
        }

        .meditator:nth-child(3) {
          animation-delay: 0.6s;
        }

        .meditator:nth-child(4) {
          animation-delay: 0.9s;
        }

        @keyframes meditate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .benefits-list {
          text-align: left;
          background: rgba(167, 139, 250, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }

        .benefits-list h3 {
          margin: 0 0 15px 0;
          color: #d8b4fe;
        }

        .benefits-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits-list li {
          padding: 8px 0;
          color: #a78bfa;
        }

        .focus-end-btn {
          padding: 12px 30px;
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          margin-top: 20px;
        }

        .focus-end-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(167, 139, 250, 0.3);
        }
      `})]})}export{u as default};
