const fs = require('fs');
let code = fs.readFileSync('frontend/src/styles/app.css', 'utf8');

const oldCSS = `.shop-sticky-note {
  width: 100%;
  min-height: 140px;
  padding: 16px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.14);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  border-radius: 2px;
  font-family: "Sora", sans-serif;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  text-align: left;
  transform: rotate(-1.3deg);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}`;

const newCSS = `@keyframes pulse-scale {
  0% {
    transform: scale(1) rotate(-1.3deg);
  }
  50% {
    transform: scale(1.05) rotate(-1.3deg);
  }
  100% {
    transform: scale(1) rotate(-1.3deg);
  }
}

.shop-sticky-note {
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
  transform: rotate(-1.3deg);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: pulse-scale 3s infinite ease-in-out;
  overflow: hidden;
  position: relative;
}`;

code = code.replace(oldCSS, newCSS);

// Also update the hover state if needed, but the animation might override hover. 
// Let's pause animation on hover.
const oldHover = `.shop-sticky-note:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.02);
  box-shadow: 0 14px 22px rgba(0, 0, 0, 0.2);
}`;

const newHover = `.shop-sticky-note:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.05); /* maintain scale */
  box-shadow: 0 14px 22px rgba(0, 0, 0, 0.2);
  animation-play-state: paused;
}`;

code = code.replace(oldHover, newHover);

fs.writeFileSync('frontend/src/styles/app.css', code);
