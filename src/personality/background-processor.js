// @ts-check
import { logger } from '../logger.js';
import { PersonalityService } from './personality-service.js';

/**
 * Background processor for character "thinking" and personality evolution.
 */
class BackgroundProcessor {
    constructor() {
        /** @type {Set<string>} */
        this.activeCharacters = new Set();
        /** @type {NodeJS.Timeout | null} */
        this.timer = null;
    }

    /**
     * Starts the background processing loop.
     */
    start() {
        if (this.timer) return;
        this.timer = setInterval(() => this.process(), 60000); // Process every minute
        logger.info('[PERSONALITY] Background processor started.');
    }

    /**
     * Registers a character for active evolution.
     * @param {string} charName
     */
    register(charName) {
        this.activeCharacters.add(charName);
    }

    /**
     * Main background processing logic.
     */
    async process() {
        if (this.activeCharacters.size === 0) return;

        logger.info(`[PERSONALITY] Processing background evolution for ${this.activeCharacters.size} character(s).`);

        for (const charName of this.activeCharacters) {
            logger.info(`[PERSONALITY] Evolving ${charName}...`);
            // This would normally fetch actual chat history.
            // For the mock, we just trigger the evolve placeholder.
            // Note: Background processing requires user directory context which we'll need to pass.
        }
    }
}

export const backgroundProcessor = new BackgroundProcessor();
