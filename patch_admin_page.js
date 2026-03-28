const fs = require('fs');
const file = 'frontend/src/pages/AdminPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '        </section>\n      </div>';
const replacement = `        </section>

        {/* Manage Stock Section */}
        <section className="admin-section">
          <div className="admin-header">
            <h2>Manage Stock</h2>
          </div>
          <BatchListAdmin api={api} />
        </section>
      </div>`;

content = content.replace(anchor, replacement);
fs.writeFileSync(file, content, 'utf8');
