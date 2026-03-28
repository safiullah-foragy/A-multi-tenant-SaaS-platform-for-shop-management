const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ProfilePage.jsx', 'utf8');

const regex = /  const handleDeleteAdmin = async \(adminId\) => \{[\s\S]*?Failed to delete admin"\);\n    \}\n  \};\n\n  const handleDeleteAdmin = async \(adminId\) => \{[\s\S]*?Failed to delete admin"\);\n    \}\n  \};\n/;

code = code.replace(regex, `  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(\`/api/admin/\${adminId}\`);
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };\n`);

// Note: Ensure colSpan is updated from 6 to 7
code = code.replace(/colSpan="6"/g, 'colSpan="7"');

fs.writeFileSync('frontend/src/pages/ProfilePage.jsx', code);
