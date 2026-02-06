#!/usr/bin/env node

/**
 * Deployment History Manager
 * 
 * Manages deployment history for automatic rollback functionality.
 * Stores last 5 known-good deployments with metadata.
 * 
 * Usage:
 *   node scripts/deployment-history.js add --url <url> --commit <sha> --run-id <id> [--validated]
 *   node scripts/deployment-history.js list
 *   node scripts/deployment-history.js get-last-good
 *   node scripts/deployment-history.js mark-rollback --index <n>
 *   node scripts/deployment-history.js cleanup
 */

const fs = require('fs').promises;
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '..', '.sisyphus', 'deployments', 'history.json');
const MAX_HISTORY_SIZE = 5;

/**
 * Ensure the deployments directory exists
 */
async function ensureDirectory() {
    const dir = path.dirname(HISTORY_FILE);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

/**
 * Load deployment history from file
 */
async function loadHistory() {
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history = JSON.parse(data);
        // Validate structure
        if (!Array.isArray(history.deployments)) {
            return { deployments: [], version: '1.0' };
        }
        return history;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { deployments: [], version: '1.0' };
        }
        throw error;
    }
}

/**
 * Save deployment history to file
 */
async function saveHistory(history) {
    await ensureDirectory();
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

/**
 * Add a new deployment to history
 */
async function addDeployment(options) {
    const history = await loadHistory();
    
    const deployment = {
        id: generateId(),
        url: options.url,
        timestamp: new Date().toISOString(),
        commit_sha: options.commit,
        run_id: options.runId,
        environment: options.environment || 'staging',
        validation_passed: options.validated === true,
        rolled_back: false,
        rollback_reason: null
    };
    
    // Add to beginning of array (most recent first)
    history.deployments.unshift(deployment);
    
    // Trim to max size - but keep at least one validated deployment
    const validatedDeployments = history.deployments.filter(d => d.validation_passed && !d.rolled_back);
    const otherDeployments = history.deployments.filter(d => !d.validation_passed || d.rolled_back);
    
    // Ensure we keep at least one validated deployment if available
    if (validatedDeployments.length > 0) {
        // Keep up to MAX_HISTORY_SIZE total, prioritizing validated ones
        const keepCount = Math.min(MAX_HISTORY_SIZE, history.deployments.length);
        const validatedToKeep = Math.min(validatedDeployments.length, keepCount);
        const otherToKeep = Math.min(otherDeployments.length, keepCount - validatedToKeep);
        
        history.deployments = [
            ...validatedDeployments.slice(0, validatedToKeep),
            ...otherDeployments.slice(0, otherToKeep)
        ];
    } else {
        // No validated deployments, just keep last N
        history.deployments = history.deployments.slice(0, MAX_HISTORY_SIZE);
    }
    
    await saveHistory(history);
    
    console.log(`✅ Deployment added to history (ID: ${deployment.id})`);
    console.log(`   URL: ${deployment.url}`);
    console.log(`   Commit: ${deployment.commit_sha}`);
    console.log(`   Validated: ${deployment.validation_passed}`);
    
    return deployment;
}

/**
 * List all deployments in history
 */
async function listDeployments() {
    const history = await loadHistory();
    
    if (history.deployments.length === 0) {
        console.log('No deployments in history.');
        return [];
    }
    
    console.log('\n📋 Deployment History');
    console.log('='.repeat(80));
    console.log('Idx | ID | Timestamp | Environment | Validated | Rolled Back | URL');
    console.log('-'.repeat(80));
    
    history.deployments.forEach((deployment, index) => {
        const timestamp = new Date(deployment.timestamp).toLocaleString();
        const validated = deployment.validation_passed ? '✅' : '❌';
        const rolledBack = deployment.rolled_back ? '⚠️' : '  ';
        const shortId = deployment.id.substring(0, 8);
        const shortUrl = deployment.url.length > 30 
            ? deployment.url.substring(0, 27) + '...' 
            : deployment.url;
        
        console.log(
            `${index.toString().padStart(3)} | ` +
            `${shortId} | ` +
            `${timestamp} | ` +
            `${deployment.environment.padEnd(11)} | ` +
            `${validated} | ` +
            `${rolledBack} | ` +
            `${shortUrl}`
        );
    });
    
    console.log('='.repeat(80));
    console.log(`Total: ${history.deployments.length} deployments (max: ${MAX_HISTORY_SIZE})`);
    
    return history.deployments;
}

/**
 * Get the last known-good deployment
 */
async function getLastGoodDeployment() {
    const history = await loadHistory();
    
    // Find first deployment that passed validation and wasn't rolled back
    const goodDeployment = history.deployments.find(
        d => d.validation_passed && !d.rolled_back
    );
    
    if (!goodDeployment) {
        console.error('❌ No known-good deployment found in history');
        process.exit(1);
    }
    
    console.log(JSON.stringify(goodDeployment, null, 2));
    return goodDeployment;
}

/**
 * Get a specific deployment by index
 */
async function getDeploymentByIndex(index) {
    const history = await loadHistory();
    
    if (index < 0 || index >= history.deployments.length) {
        console.error(`❌ Invalid deployment index: ${index}`);
        console.error(`   Valid range: 0-${history.deployments.length - 1}`);
        process.exit(1);
    }
    
    const deployment = history.deployments[index];
    console.log(JSON.stringify(deployment, null, 2));
    return deployment;
}

/**
 * Mark a deployment as rolled back
 */
async function markRollback(index, reason = 'Manual rollback') {
    const history = await loadHistory();
    
    if (index < 0 || index >= history.deployments.length) {
        console.error(`❌ Invalid deployment index: ${index}`);
        process.exit(1);
    }
    
    history.deployments[index].rolled_back = true;
    history.deployments[index].rollback_reason = reason;
    history.deployments[index].rollback_timestamp = new Date().toISOString();
    
    await saveHistory(history);
    
    console.log(`✅ Deployment at index ${index} marked as rolled back`);
    console.log(`   Reason: ${reason}`);
}

/**
 * Cleanup old/invalid deployments
 */
async function cleanupHistory() {
    const history = await loadHistory();
    const originalCount = history.deployments.length;
    
    // Remove deployments older than 30 days that failed validation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    history.deployments = history.deployments.filter(deployment => {
        const deploymentDate = new Date(deployment.timestamp);
        // Keep if: validated, not rolled back, or less than 30 days old
        return deployment.validation_passed || 
               !deployment.rolled_back || 
               deploymentDate > thirtyDaysAgo;
    });
    
    // Ensure max size
    history.deployments = history.deployments.slice(0, MAX_HISTORY_SIZE);
    
    await saveHistory(history);
    
    const removed = originalCount - history.deployments.length;
    console.log(`✅ Cleanup complete: removed ${removed} old deployments`);
    console.log(`   Remaining: ${history.deployments.length} deployments`);
}

/**
 * Generate a unique deployment ID
 */
function generateId() {
    return 'dep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Print usage information
 */
function printUsage() {
    console.log(`
Deployment History Manager

Usage:
  node scripts/deployment-history.js <command> [options]

Commands:
  add --url <url> --commit <sha> --run-id <id> [--validated] [--env <env>]
    Add a new deployment to history

  list
    List all deployments in history

  get-last-good
    Get the most recent known-good deployment (outputs JSON)

  get --index <n>
    Get a specific deployment by index (outputs JSON)

  mark-rollback --index <n> [--reason <reason>]
    Mark a deployment as rolled back

  cleanup
    Remove old/invalid deployments

Examples:
  node scripts/deployment-history.js add --url https://example.pages.dev --commit abc123 --run-id 12345 --validated
  node scripts/deployment-history.js list
  node scripts/deployment-history.js get-last-good
  node scripts/deployment-history.js get --index 0
  node scripts/deployment-history.js mark-rollback --index 0 --reason "Validation failed"
`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};
    
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.substring(2).replace(/-/g, '');
            const nextArg = args[i + 1];
            if (nextArg && !nextArg.startsWith('--')) {
                options[key] = nextArg;
                i++;
            } else {
                options[key] = true;
            }
        }
    }
    
    return { command, options };
}

/**
 * Main entry point
 */
async function main() {
    const { command, options } = parseArgs();
    
    try {
        switch (command) {
            case 'add':
                if (!options.url || !options.commit || !options.runid) {
                    console.error('❌ Missing required arguments: --url, --commit, --run-id');
                    printUsage();
                    process.exit(1);
                }
                await addDeployment({
                    url: options.url,
                    commit: options.commit,
                    runId: options.runid,
                    validated: options.validated === true || options.validated === 'true',
                    environment: options.env || 'staging'
                });
                break;
                
            case 'list':
                await listDeployments();
                break;
                
            case 'get-last-good':
                await getLastGoodDeployment();
                break;
                
            case 'get':
                if (options.index === undefined) {
                    console.error('❌ Missing required argument: --index');
                    printUsage();
                    process.exit(1);
                }
                await getDeploymentByIndex(parseInt(options.index, 10));
                break;
                
            case 'mark-rollback':
                if (options.index === undefined) {
                    console.error('❌ Missing required argument: --index');
                    printUsage();
                    process.exit(1);
                }
                await markRollback(
                    parseInt(options.index, 10),
                    options.reason || 'Manual rollback'
                );
                break;
                
            case 'cleanup':
                await cleanupHistory();
                break;
                
            default:
                console.error(`❌ Unknown command: ${command}`);
                printUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

// Export for use as module
module.exports = {
    addDeployment,
    listDeployments,
    getLastGoodDeployment,
    getDeploymentByIndex,
    markRollback,
    cleanupHistory,
    loadHistory,
    MAX_HISTORY_SIZE
};
