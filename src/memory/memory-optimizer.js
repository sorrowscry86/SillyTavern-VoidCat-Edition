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
