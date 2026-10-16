import fs from 'fs';
import path from 'path';

function processFolder(srcDir, destDir, prefix) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'));
  files.sort();
  files.forEach((file, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const targetName = `${prefix}_${num}.jpeg`;
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, targetName));
  });
  console.log(`Processed ${files.length} images from ${srcDir} to ${destDir}`);
}

processFolder('audi a3', 'public/vehicles/audi-a3', 'a3');
processFolder('audi a5', 'public/vehicles/audi-a5', 'a5');
