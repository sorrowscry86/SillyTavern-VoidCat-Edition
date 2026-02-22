// @ts-check
import path from 'node:path';
import vectra from 'vectra';
import sanitize from 'sanitize-filename';
import { getTransformersVector } from '../vectors/embedding.js';
import { logger } from '../logger.js';

/**
 * @typedef {Object} MemoryItem
 * @property {string} text - The raw text of the memory.
 * @property {number} timestamp - When the memory was created.
 * @property {string} [source] - The source of the memory (e.g., chat, user, system).
 * @property {number} [score] - Similarity score from vector search (0-1).
 * @property {string} [chatId] - The chat ID for thread isolation.
 */

/**
 * Service for managing permanent vectorized memory (Omniscience).
 */
export class MemoryService {
    /**
     * @param {import('../users.js').UserDirectoryList} directories - User directories for persistence.
     * @param {string} characterName - The name of the character this memory belongs to.
     */
    constructor(directories, characterName) {
        this.directories = directories;
        this.characterName = characterName;
        this.collectionId = `omniscience_${sanitize(characterName)}`;
        this.indexPath = path.join(directories.vectors, 'sovereign', this.collectionId);
        /** @type {vectra.LocalIndex | null} */
        this.index = null;
    }

    /**
     * Initializes the vector index.
     *
     * @returns {Promise<void>}
     */
    async init() {
        if (this.index) return;

        this.index = new vectra.LocalIndex(this.indexPath);
        if (!await this.index.isIndexCreated()) {
            logger.info(`Creating new Omniscience index for ${this.characterName} at ${this.indexPath}`);
            await this.index.createIndex();
        }
        logger.info(`Omniscience index initialized for ${this.characterName}`);
    }

    /**
     * Digitizes a piece of information into permanent memory.
     *
     * @param {string} text - The text to memorize.
     * @param {string} [source] - The source of the memory.
     * @param {string} [chatId] - The chat ID for thread isolation.
     * @returns {Promise<void>}
     */
    async memorize(text, source = 'unknown', chatId = null) {
        if (!this.index) await this.init();

        try {
            const vector = await getTransformersVector(text);
            const metadata = {
                text,
                timestamp: Date.now(),
                source,
                chatId,
            };

            // @ts-ignore
            await this.index.upsertItem({ vector, metadata });
            logger.info(`[MEMORY] Digitized new memory for ${this.characterName} (ChatID: ${chatId}): "${text.substring(0, 50)}..."`);
        } catch (error) {
            logger.error(`[MEMORY] Failed to memorize for ${this.characterName}: ${error.message}`);
        }
    }

    /**
     * Recalls relevant memories based on a query.
     *
     * @param {string} queryText - The text to search with.
     * @param {number} limit - Max number of memories to recall.
     * @param {string} [chatId] - The chat ID to filter by.
     * @returns {Promise<MemoryItem[]>}
     */
    async recall(queryText, limit = 5, chatId = null) {
        if (!this.index) await this.init();

        try {
            const vector = await getTransformersVector(queryText);

            // Define filter if chatId is provided
            const filter = chatId ? (item) => item.metadata.chatId === chatId : undefined;

            // @ts-ignore
            const results = await this.index.queryItems(vector, limit, filter);

            return results.map(r => ({
                text: r.item.metadata.text,
                timestamp: r.item.metadata.timestamp,
                source: r.item.metadata.source,
                score: r.score,
                // @ts-ignore
                chatId: r.item.metadata.chatId,
            }));
        } catch (error) {
            logger.error(`[MEMORY] Failed to recall for ${this.characterName}: ${error.message}`);
            return [];
        }
    }
}
