const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const importStr = `import AdminPage from "./pages/AdminPage";`;
const newImportStr = `import AdminPage from "./pages/AdminPage";\nimport StockManagerPage from "./pages/StockManagerPage";`;
code = code.replace(importStr, newImportStr);

const routeStr = `<Route\n        path="/admin-dashboard"`;
const newRouteStr = `<Route\n        path="/stock-manager"\n        element={\n          <ProtectedRoute>\n            <StockManagerPage />\n          </ProtectedRoute>\n        }\n      />\n      <Route\n        path="/admin-dashboard"`;
code = code.replace(routeStr, newRouteStr);

fs.writeFileSync('frontend/src/App.jsx', code);
