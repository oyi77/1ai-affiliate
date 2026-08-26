const fs = require('fs');

const path = 'services/pipelineService.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "ffmpeg -f empty -i /dev/null -c copy ${outputPath} -y || cp ${inputPath} ${outputPath}",
  "cp ${inputPath} ${outputPath}"
);
fs.writeFileSync(path, content);
console.log("Mocked pipelineService.js further to bypass ffmpeg entirely (just copy)");
