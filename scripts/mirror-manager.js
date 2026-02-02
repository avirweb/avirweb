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

    async execute(command, description, options = {}) {
        const { retries = 2, timeout = 300000 } = options;
        let lastError;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this.executeOnce(command, description, timeout);
            } catch (error) {
                lastError = error;
                console.error(`✗ Attempt ${attempt}/${retries} failed: ${error.message}`);
                
                if (attempt < retries) {
                    const delay = attempt * 5000;
                    console.log(`Retrying in ${delay/1000}s...`);
                    await this.sleep(delay);
                }
            }
        }
        
        this.errors.push({ step: description, error: lastError.message });
        throw lastError;
    }
    
    async executeOnce(command, description, timeout) {
        return new Promise((resolve, reject) => {
            console.log(`\n[${description}]`);
            console.log(`Running: ${command}`);
            
            const child = exec(command, { cwd: PROJECT_ROOT, timeout }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                    return;
                }
                
                if (stderr && !stderr.includes('Warning:')) {
                    console.warn(`Warning: ${stderr}`);
                    this.warnings.push({ step: description, warning: stderr });
                }
                
                console.log('✓ Success');
                if (stdout.trim()) {
                    console.log(stdout.slice(0, 1000));
                    if (stdout.length > 1000) {
                        console.log(`... (${stdout.length - 1000} more chars)`);
                    }
                }
                resolve(stdout);
            });
            
            child.on('error', (error) => {
                console.error(`Process error: ${error.message}`);
                reject(error);
            });
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    async validateSite() {
        console.log('\n========================================');
        console.log('  Validating Site');
        console.log('========================================');
        
        try {
            await this.execute('bash scripts/validate-site.sh', 'Validate');
        } catch (error) {
            console.error('\n✗ Site validation failed');
            console.error('Fix validation errors before deploying');
            throw error;
        }
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
        console.log('========================================');
        console.log('  AVIR Mirror System');
        console.log('========================================');
        console.log(`Started: ${this.startTime.toISOString()}`);
        console.log('');
        
        const steps = [
            { name: 'validateConfig', fn: () => this.validateConfig() },
            { name: 'crawlSite', fn: () => this.crawlSite() },
            { name: 'applyTransformations', fn: () => this.applyTransformations() },
            { name: 'validateSite', fn: () => this.validateSite() },
            { name: 'deploy', fn: () => this.deploy() },
            { name: 'commitToGitHub', fn: () => this.commitToGitHub() },
        ];
        
        for (const step of steps) {
            try {
                await step.fn();
            } catch (err) {
                console.error(`\n✗ Step "${step.name}" failed: ${err.message}`);
                this.errors.push({ step: step.name, error: err.message });
                
                if (step.name === 'validateConfig') {
                    console.error('Configuration error - cannot proceed');
                    break;
                }
                
                if (step.name === 'validateSite') {
                    console.error('Site validation failed - skipping deployment');
                    break;
                }
                
                if (step.name === 'deploy') {
                    console.error('Deployment failed - skipping GitHub commit');
                    break;
                }
            }
        }
        
        await this.saveLog();
        await this.sendNotification();
        
        const exitCode = this.errors.length === 0 ? 0 : 1;
        process.exit(exitCode);
    }
}

// Main entry point
if (require.main === module) {
    const manager = new MirrorManager();
    manager.runFullPipeline();
}

module.exports = { MirrorManager };
