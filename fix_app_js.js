const fs = require('fs');
let code = fs.readFileSync('backend/src/app.js', 'utf8');

code = code.replace(/import inventoryRoutes from "\.\/routes\/inventoryRoutes.js";\nimport inventoryRoutes from "\.\/routes\/inventoryRoutes.js";/, 'import inventoryRoutes from "./routes/inventoryRoutes.js";');
code = code.replace(/app\.use\("\/api\/inventory", inventoryRoutes\);\napp\.use\("\/api\/inventory", inventoryRoutes\);/, 'app.use("/api/inventory", inventoryRoutes);');

fs.writeFileSync('backend/src/app.js', code);
