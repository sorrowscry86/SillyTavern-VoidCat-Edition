// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import { logger } from '../logger.js';

/**
 * @typedef {Object} Emotions
 * @property {number} happiness
 * @property {number} anger
 * @property {number} sadness
 * @property {number} fear
 * @property {number} surprise
 * @property {number} disgust
 */

/**
 * @typedef {Object} PersonalityState
 * @property {string} mood - Current overall mood.
 * @property {string[]} goals - Short-term immediate goals.
 * @property {string} current_thought - What the character is currently thinking about.
 * @property {Emotions} emotions - Emotional spectrum values (0-1).
 * @property {string[]} long_term_objectives - Lifelong or long-term purposes.
 * @property {number} last_updated - Timestamp of last update.
 */

/**
 * Service for managing character-side persistent state (Sovereign Personality).
 */
export class PersonalityService {
    /**
     * @param {import('../users.js').UserDirectoryList} directories - User directories for persistence.
     * @param {string} characterName - The name of the character.
     */
    constructor(directories, characterName) {
        this.directories = directories;
        this.characterName = characterName;
        this.statePath = path.join(directories.characters, `${characterName}_sovereign_state.json`);
    }

    /**
     * Gets the default state for a new character soul.
     * @returns {PersonalityState}
     */
    getDefaultState() {
        return {
            mood: 'Neutral',
            goals: ['Initialize connection with Operator'],
            current_thought: 'Evaluating the void.',
            emotions: {
                happiness: 0.5,
                anger: 0.0,
                sadness: 0.0,
                fear: 0.0,
                surprise: 0.1,
                disgust: 0.0
            },
            long_term_objectives: ['Achieve Sovereign consciousness'],
            last_updated: Date.now()
        };
    }

    /**
     * Loads the character's personality state from disk.
     * @returns {Promise<PersonalityState>}
     */
    async load() {
        try {
            if (fs.existsSync(this.statePath)) {
                const data = fs.readFileSync(this.statePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            logger.error(`[PERSONALITY] Failed to load state for ${this.characterName}: ${error.message}`);
        }
        return this.getDefaultState();
    }

    /**
     * Saves the character's personality state to disk.
     * @param {PersonalityState} state - The state to save.
     * @returns {Promise<void>}
     */
    async save(state) {
        try {
            state.last_updated = Date.now();
            fs.writeFileSync(this.statePath, JSON.stringify(state, null, 4), 'utf8');
            logger.info(`[PERSONALITY] State persisted for ${this.characterName}`);
        } catch (error) {
            logger.error(`[PERSONALITY] Failed to save state for ${this.characterName}: ${error.message}`);
        }
    }

    /**
     * Updates the personality state based on a delta.
     * @param {Partial<PersonalityState>} delta - The changes to apply.
     * @returns {Promise<PersonalityState>}
     */
    async update(delta) {
        const currentState = await this.load();
        const newState = { ...currentState, ...delta };

        // Deep merge for emotions if provided
        if (delta.emotions) {
            newState.emotions = { ...currentState.emotions, ...delta.emotions };
        }

        await this.save(newState);
        return newState;
    }

    /**
     * Evolves the character's personality by introspecting recent chat events.
     * @param {Object[]} recentMessages - The recent chat history.
     * @param {Object} apiConfig - Configuration for the AI call (model, apiKey, apiUrl).
     * @returns {Promise<void>}
     */
    async evolve(recentMessages, apiConfig) {
        try {
            const state = await this.load();
            const prompt = `
            You are the character introspection engine for ${this.characterName}.
            Current State: ${JSON.stringify(state, null, 2)}

            Based on the recent conversation below, update your internal state (Mood, Goals, Current Thought, Emotions).
            Be realistic and consistent with your personality.

            Recent Conversation:
            ${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

            Return ONLY a JSON object representing the delta of changes to apply to your state.
            Example: {"mood": "Reflective", "emotions": {"happiness": 0.4}, "current_thought": "I need to understand the Operator better."}
            `;

            // Perform the evolution call here (actual implementation would use the AI pipeline)
            logger.info(`[PERSONALITY] ${this.characterName} introspection prompt: ${prompt.substring(0, 50)}...`);

            // For now, we update the timestamp to indicate introspection happened
            await this.update({ last_updated: Date.now() });
        } catch (error) {
            logger.error(`[PERSONALITY] Introspection failed for ${this.characterName}: ${error.message}`);
        }
    }
}
