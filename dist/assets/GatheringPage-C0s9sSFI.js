import{j as e}from"./index-BoWix2zC.js";import{r as s}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";function g({party:i}){const[r,n]=s.useState({wood:0,stone:0,herbs:0}),[t,c]=s.useState(3);return s.useEffect(()=>{const o=setInterval(()=>{n(a=>({wood:a.wood+Math.random()*5,stone:a.stone+Math.random()*3,herbs:a.herbs+Math.random()*2}))},2e3);return()=>clearInterval(o)},[]),e.jsxs("div",{className:"activity-mode-page gathering-page",children:[e.jsxs("div",{className:"mode-header",children:[e.jsx("h2",{children:"🌾 Gathering Supplies"}),e.jsx("p",{children:"Harvest resources and gather for your journey"})]}),e.jsxs("div",{className:"gathering-scene",children:[e.jsxs("div",{className:"resource-grid",children:[e.jsxs("div",{className:"resource-node",children:[e.jsx("span",{className:"resource-icon",children:"🌲"}),e.jsx("span",{className:"resource-name",children:"Wood"}),e.jsx("span",{className:"resource-amount",children:Math.floor(r.wood)})]}),e.jsxs("div",{className:"resource-node",children:[e.jsx("span",{className:"resource-icon",children:"🪨"}),e.jsx("span",{className:"resource-name",children:"Stone"}),e.jsx("span",{className:"resource-amount",children:Math.floor(r.stone)})]}),e.jsxs("div",{className:"resource-node",children:[e.jsx("span",{className:"resource-icon",children:"🌿"}),e.jsx("span",{className:"resource-name",children:"Herbs"}),e.jsx("span",{className:"resource-amount",children:Math.floor(r.herbs)})]})]}),e.jsxs("div",{className:"gatherers-info",children:[e.jsxs("p",{children:[t," party members gathering"]}),e.jsxs("div",{className:"gathering-animation",children:[e.jsx("span",{className:"gatherer",children:"🧑‍🌾"}),e.jsx("span",{className:"gatherer",children:"🧑‍🌾"}),e.jsx("span",{className:"gatherer",children:"🧑‍🌾"})]})]})]}),e.jsx("style",{jsx:!0,children:`
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
      `})]})}export{g as default};
