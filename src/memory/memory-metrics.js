// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../logger.js';

/**
 * @typedef {Object} RecallMetrics
 * @property {string} characterName - Character this recall was for.
 * @property {number} latencyMs - Wall-clock time for recall() in milliseconds.
 * @property {number} memoriesRetrieved - Count returned from vector search.
 * @property {number} memoriesAfterFiltering - Count after similarity threshold.
 * @property {number} memoriesDeduped - Count removed by dedup.
 * @property {boolean} timeDecayApplied - Whether time-decay was applied.
 * @property {number} memoriesCompressed - Count of memories shortened.
 * @property {number|null} compressionRatio - Mean compressed/original length.
 * @property {number} memoriesAfterBudget - Count after token budget truncation.
 * @property {number|null} similarityMin - Lowest similarity score in results.
 * @property {number|null} similarityMax - Highest similarity score in results.
 * @property {number|null} similarityMean - Mean similarity score.
 * @property {number} tokenBudgetUsed - Tokens consumed by included memories.
 * @property {number} tokenBudgetMax - Token budget limit from config.
 * @property {boolean} tokenBudgetExhausted - Whether the budget was fully consumed.
 * @property {Object} featureFlags - Snapshot of omniscience.optimizations config.
 * @property {string} timestamp - ISO timestamp of this event.
 */

/**
 * Captures per-request metrics for the Omniscience recall pipeline.
 * Designed for Phase 2.2A baseline capture and future A/B comparison.
 */
export class MemoryMetrics {
    /**
     * @param {string} characterName - Character name for this recall.
     * @param {Object} options - Configuration options.
     * @param {string} options.dataRoot - Root data directory for metrics file output.
     * @param {string} [options.metricsFile='omniscience_metrics.jsonl'] - Filename for JSONL output.
     * @param {Object} [options.featureFlags={}] - Current optimization flags snapshot.
     */
    constructor(characterName, { dataRoot, metricsFile = 'omniscience_metrics.jsonl', featureFlags = {} }) {
        this.characterName = characterName;
        this.metricsFilePath = path.join(dataRoot, metricsFile);
        this.featureFlags = featureFlags;

        /** @type {number} */
        this._recallStart = 0;
        /** @type {number} */
        this.latencyMs = 0;
        /** @type {import('./memory-service.js').MemoryItem[]} */
        this._memories = [];
        /** @type {number} */
        this.memoriesAfterBudget = 0;
        /** @type {number} */
        this.tokenBudgetUsed = 0;
        /** @type {number} */
        this.tokenBudgetMax = 0;
        /** @type {boolean} */
        this.tokenBudgetExhausted = false;
        /** @type {number} */
        this.memoriesAfterFiltering = 0;
        /** @type {number} */
        this.memoriesDeduped = 0;
        /** @type {boolean} */
        this.timeDecayApplied = false;
        /** @type {number} */
        this.memoriesCompressed = 0;
        /** @type {number|null} */
        this.compressionRatio = null;
    }

    /**
     * Mark the start of a recall operation.
     *
     * @returns {void}
     */
    startRecall() {
        this._recallStart = performance.now();
    }

    /**
     * Mark the end of a recall operation and capture results.
     *
     * @param {import('./memory-service.js').MemoryItem[]} memories - Results from recall().
     * @returns {void}
     */
    endRecall(memories) {
        this.latencyMs = Math.round((performance.now() - this._recallStart) * 100) / 100;
        this._memories = memories;
    }

    /**
     * Record token budget usage after the truncation loop.
     *
     * @param {number} memoriesKept - Number of memories that fit in the budget.
     * @param {number} totalMemories - Total memories returned by recall.
     * @param {number} tokensUsed - Tokens consumed by kept memories.
     * @param {number} tokenBudgetMax - Maximum token budget from config.
     * @returns {void}
     */
    /**
     * Record optimization pipeline results.
     *
     * @param {import('./memory-optimizer.js').OptimizationStats} stats - Stats from optimizeMemories().
     * @returns {void}
     */
    recordOptimizations(stats) {
        this.memoriesAfterFiltering = stats.memoriesAfterFiltering;
        this.memoriesDeduped = stats.memoriesDeduped;
        this.timeDecayApplied = stats.timeDecayApplied;
        this.memoriesCompressed = stats.memoriesCompressed;
        this.compressionRatio = stats.compressionRatio;
    }

    recordBudget(memoriesKept, totalMemories, tokensUsed, tokenBudgetMax) {
        this.memoriesAfterBudget = memoriesKept;
        this.tokenBudgetUsed = tokensUsed;
        this.tokenBudgetMax = tokenBudgetMax;
        this.tokenBudgetExhausted = memoriesKept < totalMemories;
    }

    /**
     * Build the metrics payload.
     *
     * @returns {RecallMetrics}
     */
    _buildPayload() {
        const scores = this._memories
            .map(m => m.score)
            .filter(s => typeof s === 'number');

        const similarityMin = scores.length > 0 ? Math.min(...scores) : null;
        const similarityMax = scores.length > 0 ? Math.max(...scores) : null;
        const similarityMean = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10000) / 10000
            : null;

        return {
            characterName: this.characterName,
            latencyMs: this.latencyMs,
            memoriesRetrieved: this._memories.length,
            memoriesAfterFiltering: this.memoriesAfterFiltering,
            memoriesDeduped: this.memoriesDeduped,
            timeDecayApplied: this.timeDecayApplied,
            memoriesCompressed: this.memoriesCompressed,
            compressionRatio: this.compressionRatio,
            memoriesAfterBudget: this.memoriesAfterBudget,
            similarityMin,
            similarityMax,
            similarityMean,
            tokenBudgetUsed: this.tokenBudgetUsed,
            tokenBudgetMax: this.tokenBudgetMax,
            tokenBudgetExhausted: this.tokenBudgetExhausted,
            featureFlags: this.featureFlags,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Emit the metrics to logger and JSONL file.
     *
     * @returns {void}
     */
    emit() {
        const payload = this._buildPayload();

        logger.info(`[METRICS] ${JSON.stringify(payload)}`);

        try {
            fs.appendFileSync(this.metricsFilePath, JSON.stringify(payload) + '\n', 'utf-8');
        } catch (error) {
            logger.error(`[METRICS] Failed to write metrics file: ${error.message}`);
        }
    }
}
