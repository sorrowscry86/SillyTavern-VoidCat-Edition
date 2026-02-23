#!/usr/bin/env node
import { CommandLineParser } from './src/command-line.js';
import { serverDirectory } from './src/server-directory.js';

console.log(`Node version: ${process.version}. Running in ${process.env.NODE_ENV} environment. Server directory: ${serverDirectory}`);

// config.yaml will be set when parsing command line arguments
const cliArgs = new CommandLineParser().parse(process.argv);
// Initialize the Sovereign Configuration Singleton
import { configManager } from './src/config-manager.js';
configManager.initialize(cliArgs);

process.chdir(serverDirectory);

try {
    await import('./src/server-main.js');
} catch (error) {
    console.error('A critical error has occurred while starting the server:', error);
}
