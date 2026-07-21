const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'app/home/read/page.jsx',
  'app/home/page.jsx',
  'app/(main)/write/publish/page.jsx',
  'app/(main)/write/preview/page.jsx',
  'app/(main)/profile/[username]/stats/page.jsx',
  'app/(main)/profile/page.jsx',
  'app/(main)/admin/users/page.jsx'
];

filesToPatch.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already patched
  if (content.includes('export default function') && content.includes('<Suspense')) {
    console.log(`Already patched: ${fullPath}`);
    return;
  }
  
  // Add Suspense import
  if (!content.includes('Suspense')) {
    if (content.includes('import {') && content.includes('} from "react"')) {
      content = content.replace(/} from "react"/, ', Suspense } from "react"');
    } else if (content.includes("from 'react'")) {
      content = content.replace(/} from 'react'/, ', Suspense } from \'react\'');
    } else {
      content = 'import { Suspense } from "react";\n' + content;
    }
  }
  
  // Find export default function
  const match = content.match(/export default function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/);
  if (match) {
    const funcName = match[1];
    const args = match[2];
    
    // Rename to Content
    content = content.replace(match[0], `function ${funcName}Content(${args}) {`);
    
    // Add the wrapper at the end
    content += `\n\nexport default function ${funcName}(props) {\n  return (\n    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><p className="text-gray-500">Loading...</p></div>}>\n      <${funcName}Content {...props} />\n    </Suspense>\n  );\n}\n`;
    
    fs.writeFileSync(fullPath, content);
    console.log(`Patched: ${fullPath}`);
  } else {
    console.log(`Could not find export default function in ${fullPath}`);
  }
});
