import{j as r}from"./index-BoWix2zC.js";import{r as p}from"./ui-APExzG9m.js";import"./react-BxPTE2ZZ.js";import"./backend-ClVc2H6D.js";const a={GOLD:"gold",SHARDS:"shards"},w=[{id:"skin_scholar_default",name:"Scholar (Arcane)",memberId:"member_scholar",rarity:"common",cost:0,currency:a.GOLD,description:"The classic scholarly mage in purple robes",theme:"arcane",purchasable:!0,ownable:!1},{id:"skin_scholar_crystal",name:"Crystal Sage",memberId:"member_scholar",rarity:"rare",cost:800,currency:a.GOLD,description:"A shimmering mage made of living crystal",theme:"crystal",purchasable:!0,ownable:!1},{id:"skin_scholar_shadow",name:"Shadow Sage",memberId:"member_scholar",rarity:"epic",cost:2500,currency:a.GOLD,description:"A mysterious sage cloaked in shadows",theme:"shadow",purchasable:!0,ownable:!1},{id:"skin_scholar_mystic",name:"Mystic Keeper",memberId:"member_scholar",rarity:"legendary",cost:15,currency:a.SHARDS,description:"An ancient keeper of forgotten knowledge",theme:"mystic",purchasable:!0,ownable:!1},{id:"skin_strategist_default",name:"Strategist (Steel)",memberId:"member_strategist",rarity:"common",cost:0,currency:a.GOLD,description:"The classic knight in steel armor",theme:"steel",purchasable:!0,ownable:!1},{id:"skin_strategist_gold",name:"Golden Guardian",memberId:"member_strategist",rarity:"rare",cost:1e3,currency:a.GOLD,description:"A noble knight in gleaming gold armor",theme:"gold",purchasable:!0,ownable:!1},{id:"skin_strategist_dragonscale",name:"Dragonscale Protector",memberId:"member_strategist",rarity:"epic",cost:3e3,currency:a.GOLD,description:"Armor forged from legendary dragonscales",theme:"dragon",purchasable:!0,ownable:!1},{id:"skin_alchemist_default",name:"Alchemist (Teal)",memberId:"member_alchemist",rarity:"common",cost:0,currency:a.GOLD,description:"The classic healer in teal robes",theme:"teal",purchasable:!0,ownable:!1},{id:"skin_alchemist_grandmaster",name:"Grand Alchemist",memberId:"member_alchemist",rarity:"rare",cost:900,currency:a.GOLD,description:"A master of the alchemical arts",theme:"golden",purchasable:!0,ownable:!1},{id:"skin_engineer_default",name:"Engineer (Default)",memberId:"member_engineer",rarity:"common",cost:0,currency:a.GOLD,description:"The classic gadget engineer",theme:"tech",purchasable:!0,ownable:!1},{id:"skin_engineer_steampunk",name:"Steampunk Virtuoso",memberId:"member_engineer",rarity:"epic",cost:2800,currency:a.GOLD,description:"A technician with advanced steam-powered gear",theme:"steampunk",purchasable:!0,ownable:!1}],k=[{id:"pet_starter",name:"Glowing Orb",rarity:"common",cost:0,currency:a.GOLD,description:"Your starting companion, a magical floating orb",icon:"🔮",purchasable:!0,ownable:!1},{id:"pet_phoenix",name:"Phoenix",rarity:"epic",cost:3500,currency:a.GOLD,description:"A majestic bird that grants bonus XP",icon:"🔥",bonus:{xp:.1},purchasable:!0,ownable:!1},{id:"pet_dragon",name:"Dragon",rarity:"legendary",cost:20,currency:a.SHARDS,description:"The most powerful companion, grants all stat bonuses",icon:"🐉",bonus:{xp:.15,gold:.15,defense:5},purchasable:!0,ownable:!1}],_=[{id:"potion_health_small",name:"Minor Health Potion",rarity:"common",cost:50,currency:a.GOLD,description:"Restores 25% party health",effect:{healPercent:25},quantity:0,maxStack:99},{id:"potion_health_large",name:"Major Health Potion",rarity:"rare",cost:150,currency:a.GOLD,description:"Restores 75% party health",effect:{healPercent:75},quantity:0,maxStack:50},{id:"potion_xp_boost",name:"XP Elixir",rarity:"epic",cost:300,currency:a.GOLD,description:"Grants 50% XP bonus for next session",effect:{xpMultiplier:1.5,duration:"nextSession"},quantity:0,maxStack:20},{id:"potion_invincibility",name:"Guardian's Blessing",rarity:"legendary",cost:25,currency:a.SHARDS,description:"Party takes 50% reduced damage for one battle",effect:{damageReduction:.5,duration:"nextBattle"},quantity:0,maxStack:10}];function u(s,t,n){return s.currency===a.GOLD?t>=s.cost:s.currency===a.SHARDS?n>=s.cost:!1}function S(s,t){if(!u(s,t.currency,t.shards))return{success:!1,error:"Insufficient currency"};const n={...t};return s.currency===a.GOLD?n.currency-=s.cost:s.currency===a.SHARDS&&(n.shards-=s.cost),n.ownedItems||(n.ownedItems=[]),n.ownedItems.includes(s.id)||n.ownedItems.push(s.id),{success:!0,updatedProfile:n,message:`Purchased ${s.name}!`}}function O({userProfile:s,onPurchase:t}){const[n,h]=p.useState("skins"),[i,l]=p.useState(null),b=[{id:"skins",name:"Character Skins",icon:"👤"},{id:"pets",name:"Pets",icon:"🐾"},{id:"consumables",name:"Potions",icon:"🧪"}],f={skins:w,pets:k,consumables:_}[n]||[],g=e=>{if(e.ownable===!1)return;const o=S(e,s);o.success&&(l(`${e.name} purchased!`),t(o.updatedProfile),setTimeout(()=>l(null),2e3))};return r.jsxs("div",{className:"shop-ui",children:[r.jsxs("div",{className:"shop-header",children:[r.jsx("h2",{children:"🏪 Guild Shop"}),r.jsxs("div",{className:"currency-display",children:[r.jsxs("span",{className:"currency-item",children:["💰 ",s.currency," Gold"]}),r.jsxs("span",{className:"currency-item",children:["✨ ",s.shards," Shards"]})]})]}),r.jsx("div",{className:"shop-categories",children:b.map(e=>r.jsxs("button",{className:`category-btn ${n===e.id?"active":""}`,onClick:()=>h(e.id),children:[e.icon," ",e.name]},e.id))}),i&&r.jsx("div",{className:"purchase-success",children:i}),r.jsx("div",{className:"shop-grid",children:f.map(e=>{var d;const o=u(e,s.currency,s.shards),c=(d=s.ownedItems)==null?void 0:d.includes(e.id),y=e.currency==="shards";return r.jsxs("div",{className:"shop-item",children:[r.jsx("div",{className:"item-icon",children:e.icon||(n==="skins"?"👤":"🎁")}),r.jsx("h3",{children:e.name}),r.jsx("p",{className:"item-description",children:e.description}),r.jsx("div",{className:`rarity-badge rarity-${e.rarity}`,children:e.rarity}),e.bonus&&r.jsx("div",{className:"bonus-info",children:Object.entries(e.bonus).map(([m,x])=>r.jsxs("small",{children:["+",(x*100).toFixed(0),"% ",m]},m))}),e.effect&&r.jsxs("div",{className:"effect-info",children:[r.jsx("small",{children:e.effect.healPercent&&`Restores ${e.effect.healPercent}% HP`}),r.jsx("small",{children:e.effect.xpMultiplier&&`+${((e.effect.xpMultiplier-1)*100).toFixed(0)}% XP`})]}),r.jsx("button",{className:`purchase-btn ${c?"owned":o?"available":"unavailable"}`,onClick:()=>g(e),disabled:c||!o||e.ownable===!1,children:e.ownable===!1?"Starter Item":c?"✓ Owned":o?r.jsxs(r.Fragment,{children:[e.cost," ",y?"✨":"💰"]}):"✗ Can't Afford"})]},e.id)})}),r.jsx("style",{jsx:!0,children:`
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
      `})]})}export{O as default};
