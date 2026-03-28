const fs = require('fs');

let profile = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', 'utf8');

// Add isActive to adminForm
profile = profile.replace(
  `homeAddress: "",
    otp: ""`,
  `homeAddress: "",
    otp: "",
    isActive: true`
);

// Include isActive in payload
profile = profile.replace(
  `homeAddress: adminForm.homeAddress
        }`,
  `homeAddress: adminForm.homeAddress,
          isActive: adminForm.isActive
        }`
);

// Reset form
profile = profile.replace(
  `setAdminForm({ name: "", gmail: "", phone: "", password: "", homeAddress: "", otp: "" });`,
  `setAdminForm({ name: "", gmail: "", phone: "", password: "", homeAddress: "", otp: "", isActive: true });`
);

// Handle toggle function
profile = profile.replace(
  `  const handleCreateAdmin`,
  `  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      await api.patch(\`/api/admin/\${adminId}/toggle-status\`, { isActive: !currentStatus });
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleCreateAdmin`
);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', profile);
