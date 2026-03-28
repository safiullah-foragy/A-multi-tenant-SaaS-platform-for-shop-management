const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/inventoryController.js', 'utf8');

const regex = /if \(mrp !== undefined\) batch.mrp = mrp;\n    if \(costPrice !== undefined\) batch.costPrice = costPrice;/;

const newCode = `if (mrp !== undefined) batch.mrp = mrp;
    if (costPrice !== undefined) batch.costPrice = costPrice;

    // Allow admin/owner to grant editing permission
    if ((req.user.userType === 'admin' || req.user.userType === 'owner') && req.body.editingPermission !== undefined) {
      batch.editingPermission = req.body.editingPermission;
    }`;

code = code.replace(regex, newCode);

fs.writeFileSync('backend/src/controllers/inventoryController.js', code);
