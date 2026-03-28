import fs from 'fs';

let content = fs.readFileSync('src/styles/app.css', 'utf-8');

content = content.replace(/\.profile-page\s*\{[^}]*\}/g, '');
content = content.replace(/\.profile-cover\s*\{[^}]*\}/g, '');
content = content.replace(/\.cover-pattern\s*\{[^}]*\}/g, '');
content = content.replace(/\.profile-card\s*\{[^}]*\}/g, '');
content = content.replace(/\.logo-wrap\s*\{[^}]*\}/g, '');
content = content.replace(/\.shop-meta\s*\{[^}]*\}/g, '');

const newCSS = `\n
.profile-page {
  min-height: 100vh;
  padding: 80px 32px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-card {
  max-width: 500px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.profile-title {
  text-align: center;
  color: #fff;
  margin-bottom: 24px;
}

.logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.shop-meta {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
}
.shop-meta strong {
  color: #38bdf8;
}
`;

fs.writeFileSync('src/styles/app.css', content + newCSS);
