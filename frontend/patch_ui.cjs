const fs = require('fs');

let profile = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', 'utf8');

// The admin table header
profile = profile.replace(
  `<th>Address</th>
                   <th>Created At</th>`,
  `<th>Address</th>
                   <th>Status</th>
                   <th>Created At</th>`
);

// The admin table body
profile = profile.replace(
  `<td colSpan="5">No admins created yet.</td>`,
  `<td colSpan="6">No admins created yet.</td>`
);

profile = profile.replace(
  `<td>{admin.homeAddress || "N/A"}</td>
                        <td>{new Date(admin.createdAt).toLocaleString()}</td>`,
  `<td>{admin.homeAddress || "N/A"}</td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={admin.isActive}
                              onChange={() => toggleAdminStatus(admin._id, admin.isActive)}
                            />
                            <span className="slider"></span>
                          </label>
                          {admin.isActive ? " Active" : " Inactive"}
                        </td>
                        <td>{new Date(admin.createdAt).toLocaleString()}</td>`
);

// The modal form
profile = profile.replace(
  `<label>Home Address
                 <input type="text" required value={adminForm.homeAddress} onChange={(e) => setAdminForm({...adminForm, homeAddress: e.target.value})} disabled={otpSent} />
               </label>`,
  `<label>Home Address
                 <input type="text" required value={adminForm.homeAddress} onChange={(e) => setAdminForm({...adminForm, homeAddress: e.target.value})} disabled={otpSent} />
               </label>
               <label className="checkbox-label">
                 <input type="checkbox" checked={adminForm.isActive} onChange={(e) => setAdminForm({...adminForm, isActive: e.target.checked})} disabled={otpSent} />
                 Active admin upon creation
               </label>`
);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', profile);
