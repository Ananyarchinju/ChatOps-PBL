const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:3000')) {
        content = content.replace(/http:\/\/localhost:3000/g, '');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(pagesDir);
console.log('Done.');
