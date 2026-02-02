const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || path.join(process.cwd(), '.sisyphus', 'notepads', 'avir-mirror-system');
        this.level = options.level || 'info';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    async init() {
        await fs.mkdir(this.logDir, { recursive: true });
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    async log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message, meta);
        
        console.log(formatted);
        
        const logFile = path.join(this.logDir, `mirror-${new Date().toISOString().split('T')[0]}.log`);
        await fs.appendFile(logFile, formatted + '\n').catch(() => {});
    }

    error(message, meta) {
        return this.log('error', message, meta);
    }

    warn(message, meta) {
        return this.log('warn', message, meta);
    }

    info(message, meta) {
        return this.log('info', message, meta);
    }

    debug(message, meta) {
        return this.log('debug', message, meta);
    }
}

module.exports = { Logger };
