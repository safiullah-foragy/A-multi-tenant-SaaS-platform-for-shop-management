const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ProfilePage.jsx', 'utf8');

const deleteFunction = `  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      await api.patch(\`/api/admin/\${adminId}/toggle-status\`, { isActive: !currentStatus });
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(\`/api/admin/\${adminId}\`);
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };
`;

code = code.replace(/  const toggleAdminStatus = async \(adminId, currentStatus\) => \{[\s\S]*?alert\(err.response\?\.data\?\.message \|\| "Failed to update status"\);\n    \}\n  \};\n/, deleteFunction);

const tableHeader = `                   <th>Status</th>
                   <th>Created At</th>
                   <th>Actions</th>
                 </tr>`;

code = code.replace(/                   <th>Status<\/th>\n                   <th>Created At<\/th>\n                 <\/tr>/, tableHeader);

const tableRow = `                        <td>{new Date(admin.createdAt).toLocaleString()}</td>
                        <td>
                          <button 
                            type="button"
                            onClick={() => handleDeleteAdmin(admin._id)}
                            style={{ background: '#ef4444', padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>`;

code = code.replace(/                        <td>\{new Date\(admin\.createdAt\)\.toLocaleString\(\)\}<\/td>\n                      <\/tr>/g, tableRow);

fs.writeFileSync('frontend/src/pages/ProfilePage.jsx', code);
