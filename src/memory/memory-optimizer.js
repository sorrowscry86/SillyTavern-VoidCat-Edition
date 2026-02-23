// @ts-check

/**
 * @typedef {object} MemoryItem
 * @property {string} text - The memory text content.
 * @property {number} timestamp - Unix timestamp of the memory.
 * @property {number} score - Similarity score (0-1).
 */

/**
 * Filters memories below a similarity threshold.
 * Keeps at least one memory if any exist (memory desert protection).
 *
 * @param {MemoryItem[]} memories - Memories from recall().
 * @param {number|null} threshold - Minimum similarity score. Null to skip.
 * @returns {MemoryItem[]}
 */
export function filterBySimilarity(memories, threshold) {
    if (threshold === null || threshold === undefined || memories.length === 0) {
        return memories;
    }

    const filtered = memories.filter(m => m.score >= threshold);

    // Memory desert protection: keep highest-scoring if all filtered out
    if (filtered.length === 0 && memories.length > 0) {
        return [memories.reduce((best, m) => (m.score > best.score ? m : best))];
    }

    return filtered;
}

/**
 * Keywords indicating atemporal queries where time-decay should be skipped.
 *
 * @type {RegExp}
 */
const ATEMPORAL_PATTERN = /\b(always|overall|history|everything|all\s+time|ever|never)\b/i;

/**
 * Applies time-decay weighting to re-score memories, boosting recent ones.
 * Formula: adjustedScore = score * (0.7 + 0.3 * decayFactor)
 * where decayFactor = 0.5 ^ (ageInDays / halfLifeDays)
 *
 * Skips decay for atemporal queries (containing "always", "history", etc.)
 * Re-sorts memories by adjusted score. Original score is preserved.
 *
 * @param {MemoryItem[]} memories - Memories to re-weight.
 * @param {number|null} halfLifeDays - Half-life for decay in days. Null to skip.
 * @param {string} queryText - The query text (for atemporal detection).
 * @returns {MemoryItem[]}
 */
export function applyTimeDecay(memories, halfLifeDays, queryText) {
    if (halfLifeDays === null || halfLifeDays === undefined || memories.length === 0) {
        return memories;
    }

    // Skip decay for atemporal queries
    if (ATEMPORAL_PATTERN.test(queryText)) {
        return memories;
    }

    const now = Date.now();
    const MS_PER_DAY = 86400000;

    const scored = memories.map(m => {
        const ageInDays = (now - m.timestamp) / MS_PER_DAY;
        const decayFactor = Math.pow(0.5, ageInDays / halfLifeDays);
        const adjustedScore = m.score * (0.7 + 0.3 * decayFactor);
        return { memory: m, adjustedScore };
    });

    // Sort by adjusted score descending
    scored.sort((a, b) => b.adjustedScore - a.adjustedScore);

    return scored.map(s => s.memory);
}

/**
 * Computes cosine similarity between two vectors.
 *
 * @param {number[]} a - First vector.
 * @param {number[]} b - Second vector.
 * @returns {number} Cosine similarity (0-1 for normalized vectors).
 */
function cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Removes near-duplicate memories from the result set.
 * When two memories have >85% cosine similarity between their embeddings,
 * the one with the lower Vectra score is dropped.
 *
 * @param {MemoryItem[]} memories - Memories to deduplicate.
 * @param {(text: string) => Promise<number[]>} embeddingFn - Function to embed text.
 * @returns {Promise<MemoryItem[]>}
 */
export async function deduplicate(memories, embeddingFn) {
    if (memories.length <= 1) return memories;

    const SIMILARITY_THRESHOLD = 0.85;

    // Embed all memory texts
    const embeddings = await Promise.all(memories.map(m => embeddingFn(m.text)));

    // Track which indices to remove
    const removed = new Set();

    for (let i = 0; i < memories.length; i++) {
        if (removed.has(i)) continue;
        for (let j = i + 1; j < memories.length; j++) {
            if (removed.has(j)) continue;
            const sim = cosineSimilarity(embeddings[i], embeddings[j]);
            if (sim > SIMILARITY_THRESHOLD) {
                // Remove the one with lower Vectra score
                const removeIdx = memories[i].score >= memories[j].score ? j : i;
                removed.add(removeIdx);
            }
        }
    }

    return memories.filter((_, idx) => !removed.has(idx));
}

/**
 * Tokenizes text into lowercase words, stripping punctuation.
 *
 * @param {string} text - Text to tokenize.
 * @returns {string[]}
 */
function tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
}

/**
 * Splits text into sentences.
 *
 * @param {string} text - Text to split.
 * @returns {string[]}
 */
function splitSentences(text) {
    return text.split(/[.!?]+\s+/).map(s => s.trim()).filter(Boolean);
}

/**
 * Compresses long memories using TF-IDF sentence scoring.
 * Only applies to memories with text >200 chars and >1 sentence.
 * Keeps the most query-relevant sentences up to maxChars.
 * Preserves original sentence order.
 *
 * @param {MemoryItem[]} memories - Memories to compress.
 * @param {string} queryText - Query for relevance scoring.
 * @param {number} [maxChars=200] - Target max character length.
 * @returns {MemoryItem[]}
 */
export function compressMemories(memories, queryText, maxChars = 200) {
    if (memories.length === 0) return memories;

    return memories.map(m => {
        if (m.text.length <= maxChars) return m;

        const sentences = splitSentences(m.text);
        if (sentences.length <= 1) return m;

        // Build document frequency (how many sentences contain each term)
        const queryTerms = tokenize(queryText);
        const sentenceTokens = sentences.map(s => tokenize(s));
        /** @type {Record<string, number>} */
        const docFreq = {};
        const totalDocs = sentences.length;

        for (const tokens of sentenceTokens) {
            const unique = new Set(tokens);
            for (const t of unique) {
                docFreq[t] = (docFreq[t] || 0) + 1;
            }
        }

        // Score each sentence by TF-IDF relevance to query
        const scored = sentences.map((sentence, idx) => {
            const tokens = sentenceTokens[idx];
            let score = 0;
            for (const qt of queryTerms) {
                const tf = tokens.filter(t => t === qt).length / (tokens.length || 1);
                const idf = Math.log((totalDocs + 1) / ((docFreq[qt] || 0) + 1));
                score += tf * idf;
            }
            return { sentence, score, idx };
        });

        // Sort by score descending, pick top sentences within budget
        scored.sort((a, b) => b.score - a.score);
        const kept = [];
        let charCount = 0;
        for (const s of scored) {
            if (charCount + s.sentence.length > maxChars && kept.length > 0) break;
            kept.push(s);
            charCount += s.sentence.length;
        }

        // Restore original order
        kept.sort((a, b) => a.idx - b.idx);
        const compressed = kept.map(s => s.sentence).join('. ') + '.';

        return { ...m, text: compressed };
    });
}

/**
 * @typedef {Object} OptimizationStats
 * @property {number} memoriesAfterFiltering - Count after similarity threshold.
 * @property {number} memoriesDeduped - Count removed by dedup.
 * @property {boolean} timeDecayApplied - Whether time-decay was applied.
 * @property {number} memoriesCompressed - Count of memories that were shortened.
 * @property {number|null} compressionRatio - Mean compressed/original length.
 */

/**
 * @typedef {Object} OptimizationResult
 * @property {MemoryItem[]} memories - The optimized memory set.
 * @property {OptimizationStats} stats - Per-step statistics.
 */

/**
 * Orchestrates all memory optimizations in sequence:
 * filter -> deduplicate -> time-decay -> compress.
 * Each step runs only if its flag is enabled.
 *
 * @param {MemoryItem[]} memories - Raw memories from recall().
 * @param {Object} options - Optimization options.
 * @param {number|null} options.similarityThreshold - Min score. Null to skip.
 * @param {boolean} options.deduplication - Whether to deduplicate.
 * @param {number|null} options.timeDecayDays - Half-life in days. Null to skip.
 * @param {boolean} options.compression - Whether to compress long memories.
 * @param {string} options.queryText - The query text.
 * @param {(text: string) => Promise<number[]>} options.embeddingFn - Embedding function.
 * @returns {Promise<OptimizationResult>}
 */
export async function optimizeMemories(memories, options) {
    /** @type {OptimizationStats} */
    const stats = {
        memoriesAfterFiltering: memories.length,
        memoriesDeduped: 0,
        timeDecayApplied: false,
        memoriesCompressed: 0,
        compressionRatio: null,
    };

    let result = memories;

    // 1. Similarity filtering
    if (options.similarityThreshold !== null && options.similarityThreshold !== undefined) {
        result = filterBySimilarity(result, options.similarityThreshold);
        stats.memoriesAfterFiltering = result.length;
    }

    // 2. Deduplication
    if (options.deduplication && result.length > 1) {
        const beforeCount = result.length;
        result = await deduplicate(result, options.embeddingFn);
        stats.memoriesDeduped = beforeCount - result.length;
    }

    // 3. Time-decay
    if (options.timeDecayDays !== null && options.timeDecayDays !== undefined) {
        result = applyTimeDecay(result, options.timeDecayDays, options.queryText);
        stats.timeDecayApplied = options.timeDecayDays !== null && !ATEMPORAL_PATTERN.test(options.queryText);
    }

    // 4. Compression
    if (options.compression) {
        const originalLengths = result.map(m => m.text.length);
        result = compressMemories(result, options.queryText);
        const compressedLengths = result.map(m => m.text.length);

        let compressedCount = 0;
        let totalRatio = 0;
        for (let i = 0; i < result.length; i++) {
            if (compressedLengths[i] < originalLengths[i]) {
                compressedCount++;
                totalRatio += compressedLengths[i] / originalLengths[i];
            }
        }
        stats.memoriesCompressed = compressedCount;
        stats.compressionRatio = compressedCount > 0
            ? Math.round((totalRatio / compressedCount) * 10000) / 10000
            : null;
    }

    return { memories: result, stats };
}

import fetch from 'node-fetch';

/**
 * Expands a vague user query using recent chat context.
 *
 * @param {Object[]} recentMessages - The last few messages (e.g., 3-4).
 * @param {Object} apiConfig - Configuration for the fast LLM (apiUrl, apiKey, model).
 * @returns {Promise<string|null>} - The expanded query, or null if failed.
 */
export async function expandQuery(recentMessages, apiConfig) {
    if (!apiConfig || !apiConfig.apiKey || !recentMessages || recentMessages.length === 0) {
        return null;
    }

    const apiUrl = apiConfig.apiUrl || 'https://openrouter.ai/api/v1';
    const endpoint = `${apiUrl.replace(/\/$/, '')}/chat/completions`;
    const model = apiConfig.model || 'google/gemini-2.5-flash';

    const prompt = `Rewrite the final user message into a standalone semantic search query by incorporating necessary context from the previous messages.
If the final message is already specific and standalone, return it exactly as-is.
If it is vague (e.g. "Yes", "Tell me more about it", "What happens next"), rewrite it to be specific (e.g. "Tell me more about the spectral anomaly").
DO NOT answer the user's message. DO NOT add conversational filler. ONLY output the rewritten query.`;

    const payload = {
        model: model,
        messages: [
            { role: 'system', content: prompt },
            ...recentMessages,
        ],
        temperature: 0.1,
        max_tokens: 50,
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`,
                'HTTP-Referer': 'https://sillytavern.app/',
                'X-Title': 'SillyTavern VCE OmniScience',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            /** @type {any} */
            const data = await response.json();
            const expanded = data.choices?.[0]?.message?.content?.trim();
            // Basic sanity check to prevent LLM hallucinating a massive block
            if (expanded && expanded.length < 200) {
                return expanded;
            }
            return null;
        } else {
            console.error(`[OMNISCIENCE] Query Expansion failed: ${response.status} ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('[OMNISCIENCE] Query Expansion error:', error.message);
        return null;
    }
}
