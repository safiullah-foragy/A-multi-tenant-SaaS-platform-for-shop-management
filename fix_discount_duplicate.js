const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminPage.jsx', 'utf8');

content = content.replace(
  /<th>Cost<\/th>\n\s*<th>Discount<\/th>\n\s*<th>Discount<\/th>/g,
  '<th>Cost</th>\\n                        <th>Discount</th>'
);

fs.writeFileSync('frontend/src/pages/AdminPage.jsx', content, 'utf8');
