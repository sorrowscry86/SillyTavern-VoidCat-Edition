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
