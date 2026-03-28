const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/AdminPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// There's a missing closing tag `</div>` since we removed `<div className="profile-page-split">`
// Let's replace the last `</div>` with `</div></div>` or properly balance the divs. 
// Look for the end of the return statement
content = content.replace(/  \);\n};\n\nexport default AdminPage;/g, "  );\n};\n\nexport default AdminPage;");

fs.writeFileSync(filePath, content);
