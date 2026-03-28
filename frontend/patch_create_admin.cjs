const fs = require('fs');
let content = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', 'utf8');

content = content.replace(
  `const { name, gmail, phone, password, homeAddress } = adminData;`,
  `const { name, gmail, phone, password, homeAddress, isActive } = adminData;`
);

content = content.replace(
  `homeAddress,\n    shopId: owner.shopId,`,
  `homeAddress,\n    isActive: isActive !== undefined ? isActive : true,\n    shopId: owner.shopId,`
);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', content);
