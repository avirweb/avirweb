class Notifier {
    constructor(options = {}) {
        this.webhook = options.webhook;
        this.silent = options.silent || false;
    }

    async notify(status, message, details = {}) {
        if (this.silent) return;

        const timestamp = new Date().toISOString();
        const icon = status === 'success' ? '✓' : status === 'error' ? '✗' : '⚠';
        
        console.log(`\n${icon} ${message}`);
        
        if (details.errors && details.errors.length > 0) {
            console.log('\nErrors:');
            details.errors.forEach(e => console.log(`  - ${e.step}: ${e.error}`));
        }
        
        if (details.warnings && details.warnings.length > 0) {
            console.log('\nWarnings:');
            details.warnings.forEach(w => console.log(`  - ${w.step}: ${w.warning}`));
        }

        if (this.webhook) {
            try {
                await this.sendWebhook({ status, message, details, timestamp });
            } catch (err) {
                console.error('Failed to send webhook:', err.message);
            }
        }
    }

    async sendWebhook(payload) {
        const https = require('https');
        const url = new URL(this.webhook);
        
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    success(message, details) {
        return this.notify('success', message, details);
    }

    error(message, details) {
        return this.notify('error', message, details);
    }

    warning(message, details) {
        return this.notify('warning', message, details);
    }
}

module.exports = { Notifier };
