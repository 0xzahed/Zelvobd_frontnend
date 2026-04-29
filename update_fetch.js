const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/api');

files.forEach(file => {
  if (file.includes('authApi.ts') || file.includes('client.ts') || file.includes('adminFetch.ts') || file.includes('requestWithAdminAuth.ts')) {
    return;
  }
  
  if (!file.endsWith('.ts')) return;

  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('fetch(') || content.includes('fetch (')) {
    content = 'import { adminFetch } from "@/src/api/_shared/adminFetch"\n' + content;
    content = content.replace(/\bawait fetch\(/g, 'await adminFetch(');
    content = content.replace(/\breturn fetch\(/g, 'return adminFetch(');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
