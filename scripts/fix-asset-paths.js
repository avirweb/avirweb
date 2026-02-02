const fs = require('fs');
const path = require('path');

const HTML_DIR = 'site-new';


const urlMappings = {
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/css/avir-site.shared.15a241810.css': '/images/css/avir-site.shared.15a241810.css',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.86b83e24.08fc0919c2c74909.js': '/images/js/avir-site.86b83e24.08fc0919c2c74909.js',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.36b8fb49256177c8.js': '/images/js/avir-site.schunk.36b8fb49256177c8.js',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.7f856e1c6c8f1316.js': '/images/js/avir-site.schunk.7f856e1c6f1316.js',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.b4435221be879eb3.js': '/images/js/avir-site.schunk.b4435221be879eb3.js',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/63615767e74213730c40ab8a_AVIR%20Favicon.png': '/images/63615767e74213730c40ab8a_AVIR Favicon.png',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/6361576fab509500a09d952b_Webclip.png': '/images/6361576fab509500a09d952b_Webclip.png',
    'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/6361680bf3e6a52a0fd9470c_AVIR%20Opengraph.jpg': '/images/6361680bf3e6a52a0fd9470c_AVIR Opengraph.jpg',
    'https://cdn.prod.website-files.com/5dee5ff86a04c463ac5126f1/5e5d861373b92cc146460ff9_Full%20Logo%20in%20white.svg': '/images/5e5d861373b92cc146460ff9_Full Logo in white.svg'
};

function updateHtmlFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            updateHtmlFiles(fullPath);
        } else if (file.name.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const [cdnUrl, localPath] of Object.entries(urlMappings)) {
                if (content.includes(cdnUrl)) {
                    content = content.replace(new RegExp(cdnUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), localPath);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

console.log('Updating HTML files with local asset paths...');
updateHtmlFiles(HTML_DIR);
console.log('Update complete!');