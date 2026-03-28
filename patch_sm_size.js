const fs = require('fs');
const file = 'frontend/src/pages/StockManagerPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove <td>Editing...</td> from both editing forms
content = content.replace(/<td>Editing...<\/td>/g, '');

// 2. Add <th>Size</th> below <th>Product</th> in the batches table
content = content.replace(
  /<th>Product<\/th>/g,
  '<th>Product</th>\n                                <th>Size</th>'
);

// 3. Add <td>size</td> below product name in the batch rendering
content = content.replace(
  /<td>\{batch\.productId\?\.name \|\| "Unknown Product"\}<\/td>/g,
  '<td>{batch.productId?.name || "Unknown Product"}</td>\n                                  <td>{batch.productId?.size || "N/A"}</td>'
);

fs.writeFileSync(file, content);
console.log("Patched successfully.");
