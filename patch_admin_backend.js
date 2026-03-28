const fs = require('fs');

// 1. Update controller
let controller = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');
const deleteFunction = `
// Delete Admin
export const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;
  const owner = req.owner;

  const admin = await Admin.findOneAndDelete({ _id: adminId, ownerId: owner._id });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found." });
  }

  res.json({ message: "Admin deleted successfully." });
};
`;
if (!controller.includes('deleteAdmin')) {
  controller += deleteFunction;
  fs.writeFileSync('backend/src/controllers/adminController.js', controller);
}

// 2. Update routes
let routes = fs.readFileSync('backend/src/routes/adminRoutes.js', 'utf8');
if (!routes.includes('deleteAdmin')) {
  routes = routes.replace(
    'toggleAdminStatus\n} from "../controllers/adminController.js";',
    'toggleAdminStatus,\n  deleteAdmin\n} from "../controllers/adminController.js";'
  );
  routes += '\nrouter.delete("/:adminId", authRequired, asyncHandler(deleteAdmin));\n';
  fs.writeFileSync('backend/src/routes/adminRoutes.js', routes);
}
