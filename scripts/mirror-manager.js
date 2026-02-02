#!/usr/bin/env node

/**
 * AVIR Mirror System - Main Manager
 * Orchestrates the complete mirror, transform, and deploy pipeline
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SCRIPT_DIR = path.join(__dirname);
const PROJECT_ROOT = path.dirname(SCRIPT_DIR);

class MirrorManager {
    constructor() {
        this.startTime = new Date();
        this.errors = [];
        this.warnings = [];
    }

    async execute(command, description) {
        return new Promise((resolve, reject) => {
            console.log(`\n[${description}]`);
            console.log(`Running: ${command}`);
            
            exec(command, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    this.errors.push({ step: description, error: error.message, stderr });
                    reject(error);
                    return;
                }
                
                if (stderr) {
                    console.warn(`Warning: ${stderr}`);
                    this.warnings.push({ step: description, warning: stderr });
                }
                
                console.log('✓ Success');
                console.log(stdout);
                resolve(stdout);
            });
        });
    }

    async validateConfig() {
        console.log('========================================');
        console.log('  Validating Configuration');
        console.log('========================================');
        
        // Validate secrets directory
        const secretsDir = path.join(PROJECT_ROOT, '.secrets');
        try {
            await fs.access(secretsDir);
            console.log('✓ Secrets directory exists');
        } catch (err) {
            throw new Error('Secrets directory not found. Run: bash scripts/setup-credentials.sh');
        }

        // Validate credentials using Node.js library
        const { validateAllCredentials } = require('./lib/credentials.js');
        const result = await validateAllCredentials();
        
        if (!result.valid) {
            throw new Error(`Missing credentials: ${result.missing.join(', ')}`);
        }
        
        console.log('✓ All credentials configured');
    }

    async crawlSite() {
        console.log('\n========================================');
        console.log('  Crawling Website');
        console.log('========================================');
        
        await this.execute('node scripts/crawl-complete.js', 'Crawl');
    }

    async applyTransformations() {
        console.log('\n========================================');
        console.log('  Applying Transformations');
        console.log('========================================');
        
        await this.execute('bash transformations/apply-transformations.sh', 'Transform');
    }

    async deploy() {
        console.log('\n========================================');
        console.log('  Deploying to Cloudflare');
        console.log('========================================');
        
        await this.execute('bash scripts/deploy-to-cloudflare.sh', 'Deploy');
    }

    async commitToGitHub() {
        console.log('\n========================================');
        console.log('  Committing to GitHub');
        console.log('========================================');
        
        await this.execute('bash scripts/commit-and-push.sh', 'Git Push');
    }

    async saveLog() {
        const completedAt = new Date();
        const logFile = path.join(PROJECT_ROOT, '.sisyphus', 'notepads', 'avir-mirror-system', 'mirrors.md');
        
        await fs.mkdir(path.dirname(logFile), { recursive: true });
        
        const log = {
            startTime: this.startTime.toISOString(),
            endTime: completedAt.toISOString(),
            durationMs: completedAt - this.startTime,
            status: this.errors.length === 0 ? 'success' : 'partial_failure',
            errors: this.errors,
            warnings: this.warnings,
        };

        const logEntry = `
## Mirror Run - ${this.startTime.toISOString()}

- Status: ${log.status}
- Duration: ${(log.durationMs / 1000).toFixed(2)}s
- Errors: ${this.errors.length}
- Warnings: ${this.warnings.length}

### Errors
${this.errors.map(e => `- ${e.step}: ${e.error}`).join('\n') || 'None'}

### Warnings
${this.warnings.map(w => `- ${w.step}: ${w.warning}`).join('\n') || 'None'}

---

`;
        
        try {
            await fs.appendFile(logFile, logEntry);
            console.log(`\n✓ Log saved to ${logFile}`);
        } catch (err) {
            console.error('Failed to save log:', err.message);
        }
    }

    async sendNotification() {
        if (this.errors.length === 0) {
            console.log('\n✓ Mirror completed successfully!');
        } else {
            console.error(`\n✗ Mirror completed with ${this.errors.length} errors`);
        }
    }

    async runFullPipeline() {
        try {
            await this.validateConfig();
            await this.crawlSite();
            await this.applyTransformations();
            await this.deploy();
            await this.commitToGitHub();
            await this.saveLog();
            await this.sendNotification();
            process.exit(0);
        } catch (err) {
            console.error('\nFatal error:', err.message);
            await this.saveLog();
            await this.sendNotification();
            process.exit(1);
        }
    }
}

// Main entry point
if (require.main === module) {
    const manager = new MirrorManager();
    manager.runFullPipeline();
}

module.exports = { MirrorManager };
