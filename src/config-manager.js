// @ts-check
/**
 * Sovereign Configuration Singleton.
 * Encapsulates the configuration state to prevent global scope pollution.
 * @class
 */
class ConfigurationManager {
    constructor() {
        /** @type {import('./command-line.js').CommandLineArguments | null} */
        this.args = null;
        /** @type {string | null} */
        this.dataRoot = null;
    }

    /**
     * Initializes the configuration manager with parsed arguments.
     * @param {import('./command-line.js').CommandLineArguments} args
     */
    initialize(args) {
        if (this.args) {
            throw new Error('ConfigurationManager is already initialized. The Singleton is absolute.');
        }
        this.args = Object.freeze(args);
        this.dataRoot = args.dataRoot;
        // @ts-ignore
        globalThis.DATA_ROOT = args.dataRoot;
    }

    /**
     * Gets the command line arguments.
     * @returns {import('./command-line.js').CommandLineArguments}
     */
    getArgs() {
        if (!this.args) {
            throw new Error('ConfigurationManager not initialized. The void is empty.');
        }
        return this.args;
    }

    /**
     * Gets the data root directory.
     * @returns {string}
     */
    getDataRoot() {
        if (!this.dataRoot) {
            throw new Error('ConfigurationManager not initialized. The void is empty.');
        }
        return this.dataRoot;
    }
}

export const configManager = new ConfigurationManager();
