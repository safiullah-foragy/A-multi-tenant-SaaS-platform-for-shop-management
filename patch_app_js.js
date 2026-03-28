const fs = require('fs');
let code = fs.readFileSync('backend/src/app.js', 'utf8');

const importStr = `import staffRoutes from "./routes/staffRoutes.js";`;
const newImportStr = `import staffRoutes from "./routes/staffRoutes.js";\nimport inventoryRoutes from "./routes/inventoryRoutes.js";`;

code = code.replace(importStr, newImportStr);

const routeStr = `app.use("/api/staff", staffRoutes);`;
const newRouteStr = `app.use("/api/staff", staffRoutes);\napp.use("/api/inventory", inventoryRoutes);`;

code = code.replace(routeStr, newRouteStr);

fs.writeFileSync('backend/src/app.js', code);
