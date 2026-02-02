/**
 * Credential Retrieval Library for AVIR Mirror System
 * 
 * Usage:
 *   const { getCloudflareToken } = require('./scripts/lib/credentials.js');
 *   const token = await getCloudflareToken();
 */

const fs = require('fs').promises;
const path = require('path');

const SECRETS_DIR = '/home/agent/avir/.secrets';

/**
 * Generic function to get a credential from a file
 * @param {string} filename - Name of the credential file
 * @returns {Promise<string>} - The credential value
 * @throws {Error} - If credential file is missing, unreadable, or empty
 */
async function getCredential(filename) {
    if (!filename) {
        throw new Error('No credential filename specified');
    }
    
    const filepath = path.join(SECRETS_DIR, filename);
    
    try {
        await fs.access(filepath, fs.constants.R_OK);
    } catch (err) {
        throw new Error(`Credential file not found or not readable: ${filepath}`);
    }
    
    let content;
    try {
        content = await fs.readFile(filepath, 'utf8');
    } catch (err) {
        throw new Error(`Failed to read credential file: ${filepath} - ${err.message}`);
    }
    
    const value = content.trim();
    
    if (!value) {
        throw new Error(`Credential file is empty: ${filepath}`);
    }
    
    return value;
}

/**
 * Get Cloudflare API token
 * @returns {Promise<string>}
 */
async function getCloudflareToken() {
    return getCredential('cloudflare-token');
}

/**
 * Get Cloudflare account ID
 * @returns {Promise<string>}
 */
async function getCloudflareAccountId() {
    return getCredential('cloudflare-account-id');
}

/**
 * Get GitHub SSH private key
 * @returns {Promise<string>}
 */
async function getGithubSshKey() {
    return getCredential('github-ssh-key');
}

/**
 * Get GitHub username
 * @returns {Promise<string>}
 */
async function getGithubUsername() {
    return getCredential('github-username');
}

/**
 * Get GitHub email
 * @returns {Promise<string>}
 */
async function getGithubEmail() {
    return getCredential('github-email');
}

/**
 * Get Turnstile site key
 * @returns {Promise<string>}
 */
async function getTurnstileSiteKey() {
    return getCredential('turnstile-site-key');
}

/**
 * Get Microsoft Graph API client ID
 * @returns {Promise<string>}
 */
async function getGraphClientId() {
    return getCredential('graph-api/client-id');
}

/**
 * Get Microsoft Graph API client secret
 * @returns {Promise<string>}
 */
async function getGraphClientSecret() {
    return getCredential('graph-api/client-secret');
}

/**
 * Get Microsoft Graph API tenant ID
 * @returns {Promise<string>}
 */
async function getGraphTenantId() {
    return getCredential('graph-api/tenant-id');
}

/**
 * Validate that all required credentials exist
 * @returns {Promise<{valid: boolean, missing: string[], errors: string[]}>}
 */
async function validateAllCredentials() {
    const credentials = [
        { name: 'cloudflare-token', getter: getCloudflareToken },
        { name: 'cloudflare-account-id', getter: getCloudflareAccountId },
        { name: 'github-ssh-key', getter: getGithubSshKey },
        { name: 'github-username', getter: getGithubUsername },
        { name: 'github-email', getter: getGithubEmail },
        { name: 'turnstile-site-key', getter: getTurnstileSiteKey },
    ];
    
    const missing = [];
    const errors = [];
    
    for (const { name, getter } of credentials) {
        try {
            await getter();
        } catch (err) {
            missing.push(name);
            errors.push(err.message);
        }
    }
    
    return {
        valid: missing.length === 0,
        missing,
        errors
    };
}

module.exports = {
    getCredential,
    getCloudflareToken,
    getCloudflareAccountId,
    getGithubSshKey,
    getGithubUsername,
    getGithubEmail,
    getTurnstileSiteKey,
    getGraphClientId,
    getGraphClientSecret,
    getGraphTenantId,
    validateAllCredentials
};
