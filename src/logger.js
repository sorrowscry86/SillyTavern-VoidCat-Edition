// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import { color } from './util.js';
import { configManager } from './config-manager.js';

/**
 * @typedef {'access' | 'security' | 'error' | 'info' | 'warn'} LogType
 */

class SovereignLogger {
    constructor() {
        this.dataRoot = configManager.getDataRoot();
        this.paths = {
            access: path.join(this.dataRoot, 'access.log'),
            security: path.join(this.dataRoot, 'security.log'),
            error: path.join(this.dataRoot, 'error.log'),
        };
    }

    /**
     * @param {LogType} type
     * @param {string} message
     */
    log(type, message) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

        // Console Output
        this._consoleLog(type, formattedMessage);

        // File Persistence
        this._fileLog(type, formattedMessage);
    }

    /**
     * @param {LogType} type
     * @param {string} message
     */
    _consoleLog(type, message) {
        switch (type) {
            case 'security':
                console.warn(color.red(message));
                break;
            case 'error':
                console.error(color.red(message));
                break;
            case 'warn':
                console.warn(color.yellow(message));
                break;
            case 'access':
            case 'info':
            default:
                console.info(message);
                break;
        }
    }

    /**
     * @param {LogType} type
     * @param {string} message
     */
    _fileLog(type, message) {
        let logPath;
        if (type === 'security') logPath = this.paths.security;
        else if (type === 'error') logPath = this.paths.error;
        else if (type === 'access') logPath = this.paths.access;
        else return; // Don't persist pure info/warn to file unless they have a type

        try {
            fs.appendFileSync(logPath, message + '\n');
        } catch (err) {
            console.error('Failed to write to log file:', logPath, err);
        }
    }

    security(message) { this.log('security', message); }
    access(message) { this.log('access', message); }
    error(message) { this.log('error', message); }
    info(message) { this.log('info', message); }
    warn(message) { this.log('warn', message); }

    migrateAccessLog() {
        try {
            if (!fs.existsSync('access.log')) {
                return;
            }
            const logPath = this.paths.access;
            if (fs.existsSync(logPath)) {
                return;
            }
            fs.renameSync('access.log', logPath);
            console.log(color.yellow('Migrated access.log to new location:'), logPath);
        } catch (e) {
            console.error('Failed to migrate access log:', e);
            console.info('Please move access.log to the data directory manually.');
        }
    }

    getAccessLogPath() {
        return this.paths.access;
    }
}

export const logger = new SovereignLogger();
export const getAccessLogPath = () => logger.getAccessLogPath();
export const migrateAccessLog = () => logger.migrateAccessLog();
