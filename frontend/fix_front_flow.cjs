const fs = require('fs');
let content = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', 'utf8');

content = content.replace(
`  const requestAdminOtp = async () => {
    try {
      setAdminMessage("Requesting OTP...");
      const { data } = await api.post("/api/admin/request-create-admin-otp");
      setOtpSent(true);
      setAdminMessage(data.message || "OTP sent to your email!");
    } catch (err) {
      setAdminMessage(err.response?.data?.message || "Failed to request OTP.");
    }
  };`,
`  const requestAdminOtp = async (e) => {
    e.preventDefault();
    if (!adminForm.gmail) {
      setAdminMessage("Please provide the admin Gmail first.");
      return;
    }
    try {
      setAdminMessage("Sending OTP to admin email...");
      const { data } = await api.post("/api/admin/request-create-admin-otp", { adminGmail: adminForm.gmail });
      setOtpSent(true);
      setAdminMessage(data.message || "OTP sent to admin email!");
    } catch (err) {
      setAdminMessage(err.response?.data?.message || "Failed to request OTP.");
    }
  };`);

content = content.replace(
`             {!otpSent ? (
               <div className="stack">
                 <button onClick={requestAdminOtp}>Send OTP to my email</button>
                 {adminMessage && <p className="message">{adminMessage}</p>}
               </div>
             ) : (
               <form className="stack admin-form" onSubmit={handleCreateAdmin}>
                 <label>Admin Name
                   <input type="text" required value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} />
                 </label>
                 <label>Admin Gmail
                   <input type="email" required value={adminForm.gmail} onChange={(e) => setAdminForm({...adminForm, gmail: e.target.value})} />
                 </label>
                 <label>Admin Phone
                   <input type="text" required value={adminForm.phone} onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} />
                 </label>
                 <label>Admin Password
                   <input type="password" required value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} />
                 </label>
                 <label>Home Address
                   <input type="text" required value={adminForm.homeAddress} onChange={(e) => setAdminForm({...adminForm, homeAddress: e.target.value})} />
                 </label>
                 <label>Verify OTP
                   <input type="text" required value={adminForm.otp} onChange={(e) => setAdminForm({...adminForm, otp: e.target.value})} placeholder="Check your email" />
                 </label>
                 <button type="submit">Verify & Create Admin</button>
                 {adminMessage && <p className="message">{adminMessage}</p>}
               </form>
             )}`,
`             <form className="stack admin-form" onSubmit={handleCreateAdmin}>
               <label>Admin Name
                 <input type="text" required value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Gmail
                 <input type="email" required value={adminForm.gmail} onChange={(e) => setAdminForm({...adminForm, gmail: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Phone
                 <input type="text" required value={adminForm.phone} onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Password
                 <input type="password" required value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} disabled={otpSent} />
               </label>
               <label>Home Address
                 <input type="text" required value={adminForm.homeAddress} onChange={(e) => setAdminForm({...adminForm, homeAddress: e.target.value})} disabled={otpSent} />
               </label>
               
               {!otpSent ? (
                 <button type="button" onClick={requestAdminOtp}>Send OTP to Admin Email</button>
               ) : (
                 <div className="otp-box stack">
                   <label>Verify OTP (Sent to Admin Email)
                     <input type="text" required value={adminForm.otp} onChange={(e) => setAdminForm({...adminForm, otp: e.target.value})} placeholder="Check admin email for OTP" />
                   </label>
                   <button type="submit">Verify & Create Admin</button>
                 </div>
               )}
               {adminMessage && <p className="message" style={{color: '#94a3b8'}}>{adminMessage}</p>}
             </form>`);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/ProfilePage.jsx', content);
