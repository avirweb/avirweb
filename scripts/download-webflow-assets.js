const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = 'site-new';

[ 'assets', 'images' ].forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});
const criticalAssets = [
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/css/avir-site.shared.15a241810.css',
        localPath: 'images/css/avir-site.shared.15a241810.css'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.86b83e24.08fc0919c2c74909.js',
        localPath: 'images/js/avir-site.86b83e24.08fc0919c2c74909.js'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.36b8fb49256177c8.js',
        localPath: 'images/js/avir-site.schunk.36b8fb49256177c8.js'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.7f856e1c6c8f1316.js',
        localPath: 'images/js/avir-site.schunk.7f856e1c6c8f1316.js'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.b4435221be879eb3.js',
        localPath: 'images/js/avir-site.schunk.b4435221be879eb3.js'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/63615767e74213730c40ab8a_AVIR%20Favicon.png',
        localPath: 'images/63615767e74213730c40ab8a_AVIR Favicon.png'
    },
    {
        url: 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/6361576fab509500a09d952b_Webclip.png',
        localPath: 'images/6361576fab509500a09d952b_Webclip.png'
    }
];

function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filePath);

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${filePath}`);
                    resolve();
                });
            } else {
                file.close();
                fs.unlink(filePath, () => {});
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function downloadAllAssets() {
    console.log('Downloading critical Webflow assets...');
    
    for (const asset of criticalAssets) {
        const fullLocalPath = path.join(OUTPUT_DIR, asset.localPath);
        const localDir = path.dirname(fullLocalPath);
        
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        
        try {
            await downloadFile(asset.url, fullLocalPath);
        } catch (error) {
            console.error(`Failed to download ${asset.url}: ${error.message}`);
        }
    }
    
    console.log('Download complete!');
}

downloadAllAssets().catch(console.error);