const fs = require('fs');

const path = 'services/pipelineService.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "const apiUrl = `${TIKTOK_API}?url=${encodeURIComponent(url)}`;",
  `const apiUrl = \`\${TIKTOK_API}?url=\${url}&hd=1\`;`
);
fs.writeFileSync(path, content);
console.log("Updated pipelineService.js TikTok URL query params");
