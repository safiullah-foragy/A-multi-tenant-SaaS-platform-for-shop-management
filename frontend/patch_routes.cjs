const fs = require('fs');

let routes = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/routes/adminRoutes.js', 'utf8');
if (!routes.includes('toggleAdminStatus')) {
  routes = routes.replace(
    `  listAdmins\n} from "../controllers/adminController.js";`,
    `  listAdmins,\n  toggleAdminStatus\n} from "../controllers/adminController.js";`
  );
  routes += `\nrouter.patch("/:adminId/toggle-status", authRequired, asyncHandler(toggleAdminStatus));\n`;
  fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/routes/adminRoutes.js', routes);
}
