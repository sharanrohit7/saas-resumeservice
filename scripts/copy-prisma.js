// scripts/copy-prisma.js (CommonJS version)
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'prisma', 'generated', 'prisma');
const destDir = path.join(__dirname, '..', 'dist', 'prisma', 'generated', 'prisma');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach(entry => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyDir(srcDir, destDir);
