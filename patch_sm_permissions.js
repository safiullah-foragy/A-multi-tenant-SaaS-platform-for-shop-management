const fs = require('fs');
const file = 'frontend/src/pages/StockManagerPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Products Table Header
content = content.replace(
  /<th>Permission<\/th><th>Actions<\/th>/g,
  '<th>Actions</th>'
);

// Products Table Row (Not editing)
content = content.replace(
  /<td>\{p\.editingPermission \? <span style=\{\{color: '#10b981'\}\}>Allowed<\/span> : <span style=\{\{color: '#ef4444'\}\}>Locked<\/span>\}<\/td>\s*<td>\s*\{p\.editingPermission && \(\s*<button onClick=\{\(\) => startEditProduct\(p\)\} style=\{\{padding: '4px 8px', fontSize: '0.8rem'\}\}>Edit<\/button>\s*\)\}\s*<\/td>/g,
  `<td>
                            <button 
                              onClick={() => startEditProduct(p)} 
                              style={{
                                padding: '4px 8px', 
                                fontSize: '0.8rem',
                                opacity: p.editingPermission ? 1 : 0.5,
                                cursor: p.editingPermission ? 'pointer' : 'not-allowed'
                              }}
                              title={!p.editingPermission ? "You don't have permission" : ""}
                            >
                              Edit
                            </button>
                          </td>`
);

// Batches Table Header
content = content.replace(
  /<th>Permissions<\/th>\s*<th>Actions<\/th>/g,
  '<th>Actions</th>'
);

// Batches Table Row (Not editing)
content = content.replace(
  /<td>\{batch\.editingPermission \? <span style=\{\{color: '#10b981'\}\}>Allowed<\/span> : <span style=\{\{color: '#ef4444'\}\}>Locked<\/span>\}<\/td>\s*<td>\s*\{batch\.editingPermission && \(\s*<button onClick=\{\(\) => startEditBatch\(batch\)\} style=\{\{padding: '4px 8px', fontSize: '0.8rem'\}\}>Edit<\/button>\s*\)\}\s*<\/td>/g,
  `<td>
                                        <button 
                                          onClick={() => startEditBatch(batch)} 
                                          style={{
                                            padding: '4px 8px', 
                                            fontSize: '0.8rem',
                                            opacity: batch.editingPermission ? 1 : 0.5,
                                            cursor: batch.editingPermission ? 'pointer' : 'not-allowed'
                                          }}
                                          title={!batch.editingPermission ? "You don't have permission" : ""}
                                        >
                                          Edit
                                        </button>
                                      </td>`
);

fs.writeFileSync(file, content);
console.log("Patched successfully");
