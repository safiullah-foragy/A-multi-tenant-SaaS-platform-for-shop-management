const fs = require('fs');
let code = fs.readFileSync('frontend/src/styles/app.css', 'utf8');

code = code.replace(/@keyframes pulse-scale \{[\s\S]*?\}\n\n\.shop-sticky-note \{[\s\S]*?\}/, 
`@keyframes pulse-scale {
  0% {
    transform: scale(1) rotate(var(--rot, -1.3deg));
  }
  50% {
    transform: scale(1.05) rotate(var(--rot, -1.3deg));
  }
  100% {
    transform: scale(1) rotate(var(--rot, -1.3deg));
  }
}

.shop-sticky-note {
  --rot: -1.3deg;
  width: 100%;
  min-height: 140px;
  padding: 16px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.14);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  font-family: "Sora", sans-serif;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  text-align: left;
  transform: rotate(var(--rot));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: pulse-scale 3s infinite ease-in-out;
  overflow: hidden;
  position: relative;
}`);

code = code.replace(/\.shop-sticky-note:nth-child\(2n\) \{\n.*?background: linear-gradient\(135deg, #34d399, #059669\);\n.*?color: #fff;\n.*?transform: rotate\(1\.1deg\);\n\}/, 
`.shop-sticky-note:nth-child(2n) {
  --rot: 1.1deg;
  background: linear-gradient(135deg, #34d399, #059669);
  color: #fff;
  transform: rotate(var(--rot));
}`);

code = code.replace(/\.shop-sticky-note:nth-child\(3n\) \{\n.*?background: linear-gradient\(135deg, #fbbf24, #d97706\);\n.*?color: #fff;\n.*?transform: rotate\(-0\.5deg\);\n\}/, 
`.shop-sticky-note:nth-child(3n) {
  --rot: -0.5deg;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  color: #fff;
  transform: rotate(var(--rot));
}`);

code = code.replace(/\.shop-sticky-note:hover \{\n\s*transform: rotate\(0deg\).*?\n.*?box-shadow: 0 14px 22px rgba\(0, 0, 0, 0\.2\);\n\s*animation-play-state: paused;\n\}/, 
`.shop-sticky-note:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.05); /* maintain scale */
  box-shadow: 0 14px 22px rgba(0, 0, 0, 0.2);
  animation-play-state: paused;
}`);

fs.writeFileSync('frontend/src/styles/app.css', code);
