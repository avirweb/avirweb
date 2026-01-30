const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SITE_DIR = path.join(__dirname, '../site');
const BASE_URL = 'https://avirwebtest.pages.dev';

console.log('Adding canonical tags to all HTML files...\n');

const htmlFiles = glob.sync('**/*.html', { cwd: SITE_DIR, absolute: true });
let updated = 0;

htmlFiles.forEach(filePath => {
    const relativePath = path.relative(SITE_DIR, filePath);
    
    let pagePath = relativePath.replace(/\\/g, '/').replace('/index.html', '').replace('.html', '');
    if (pagePath === 'index') pagePath = '';
    
    const canonicalUrl = `${BASE_URL}/${pagePath}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('rel="canonical"')) {
        return;
    }
    
    if (content.includes('<meta charset')) {
        content = content.replace(
            /(<meta charset[^>]+>)/i,
            `$1\n    ${canonicalTag}`
        );
    } else if (content.includes('<head>')) {
        content = content.replace(
            '<head>',
            `<head>\n    ${canonicalTag}`
        );
    }
    
    fs.writeFileSync(filePath, content);
    updated++;
    console.log(`✓ ${relativePath} -> ${canonicalUrl}`);
});

console.log(`\n✅ Updated ${updated} files with canonical tags`);
