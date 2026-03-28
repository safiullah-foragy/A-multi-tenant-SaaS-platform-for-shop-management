const fs = require('fs');
const file = 'frontend/src/pages/AdminPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/                      <\/tr>\n        <\/section>/g, 
"                      </tr>\n" +
"                    ))\n" +
"                  )}\n" +
"               </tbody>\n" +
"             </table>\n" +
"          </div>\n" +
"        </section>");

fs.writeFileSync(file, content, 'utf8');
