const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

const target = `                 </div>
              )}
            </div>`;

const replacement = `                 </div>
              )}
              
              <button
                onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              >
                Dashboard
              </button>
            </div>`;

content = content.replace(target, replacement);
// Also it's possible it's \r\n
content = content.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/Header.tsx', content);
