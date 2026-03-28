const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');
code = code.replace(/import StockManagerPage from "\.\/pages\/StockManagerPage";\nimport StockManagerPage from "\.\/pages\/StockManagerPage";/, 'import StockManagerPage from "./pages/StockManagerPage";');
fs.writeFileSync('frontend/src/App.jsx', code);
