const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/AdminPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const newLayout = `
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="secondary" onClick={handleLogout}>Logout</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="primary" onClick={() => openModal("cashier")}>+ Create Cashier</button>
          <button className="primary" onClick={() => openModal("stockManager")}>+ Create Stock Manager</button>
        </div>
        <div style={{ width: '80px' }}></div> {/* Spacer for centering */}
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
`;

content = content.replace(/  return \([\s\S]*?<div className="profile-half right-half" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>/, newLayout);

fs.writeFileSync(filePath, content);
