const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AdminPage.jsx', 'utf8');

// 1. Update startEdit
content = content.replace(
  /const startEdit = \(batch\) => \{[\s\S]*?setEditForm\(\{[\s\S]*?\}\);\n  \};/,
  `const startEdit = (batch) => {
    window.alert("Note:\\n1. A discount up to (MRP - Cost) will be cut from your profit for that product.\\n2. A discount greater than (MRP - Cost) will reduce your cost.");
    setEditingId(batch._id);
    setEditForm({
      quantity: batch.quantity,
      mrp: batch.mrp,
      costPrice: batch.costPrice,
      discount: batch.discount || 0
    });
  };`
);

// 2. Update saveEdit
content = content.replace(
  /const saveEdit = async \(batchId\) => \{[\s\S]*?try \{[\s\S]*?await api\.patch\(.*\{[\s\S]*?costPrice: Number\(editForm\.costPrice\)[\s\S]*?\}\);/,
  `const saveEdit = async (batchId) => {
    try {
      await api.patch(\`/api/inventory/batches/\${batchId}\`, {
        quantity: Number(editForm.quantity),
        mrp: Number(editForm.mrp),
        costPrice: Number(editForm.costPrice),
        discount: Number(editForm.discount || 0)
      });`
);

// 3. Update table headers
content = content.replace(
  /<th>Cost<\/th>/g,
  `<th>Cost</th>\n                        <th>Discount</th>`
);

// 4. Update editing table cells
content = content.replace(
  /<td><input type="number" value=\{editForm\.costPrice\} onChange=\{e => setEditForm\(\{\.\.\.editForm, costPrice: e\.target\.value\}\)\} style=\{\{width: '60px'\}\} \/><\/td>/g,
  `<td><input type="number" value={editForm.costPrice} onChange={e => setEditForm({...editForm, costPrice: e.target.value})} style={{width: '60px'}} /></td>\n                              <td><input type="number" value={editForm.discount} onChange={e => setEditForm({...editForm, discount: e.target.value})} style={{width: '60px'}} /></td>`
);

// 5. Update view table cells
content = content.replace(
  /<td>\{b\.costPrice\}<\/td>/g,
  `<td>{b.costPrice}</td>\n                              <td>{b.discount || 0}</td>`
);

fs.writeFileSync('frontend/src/pages/AdminPage.jsx', content, 'utf8');
