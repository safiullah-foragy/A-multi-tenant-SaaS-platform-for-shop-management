const fs = require('fs');
const file = 'frontend/src/pages/StockManagerPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix headers
content = content.replace(
  /<th>Product<\/th>\s*<th>Size<\/th>\s*<th>Size<\/th>\s*<th>Size<\/th>/g,
  '<th>Product</th>\n                                <th>Size</th>'
);

// Fix cells
content = content.replace(
  /<td>\{batch\.productId\?\.name \|\| "Unknown Product"\}<\/td>\s*<td>\{batch\.productId\?\.size \|\| "N\/A"\}<\/td>\s*<td>\{batch\.productId\?\.size \|\| "N\/A"\}<\/td>/g,
  '<td>{batch.productId?.name || "Unknown Product"}</td>\n                                  <td>{batch.productId?.size || "N/A"}</td>'
);

fs.writeFileSync(file, content);
console.log("Fixed smoothly");
