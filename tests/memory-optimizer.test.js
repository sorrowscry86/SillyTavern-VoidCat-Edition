import { describe, test, expect } from '@jest/globals';
import { filterBySimilarity, deduplicate } from '../src/memory/memory-optimizer.js';

describe('filterBySimilarity', () => {
    const memories = [
        { text: 'memory A', timestamp: 1000, score: 0.9 },
        { text: 'memory B', timestamp: 2000, score: 0.5 },
        { text: 'memory C', timestamp: 3000, score: 0.2 },
        { text: 'memory D', timestamp: 4000, score: 0.1 },
    ];

    test('returns all memories when threshold is null', () => {
        expect(filterBySimilarity(memories, null)).toEqual(memories);
    });

    test('filters memories below threshold', () => {
        const result = filterBySimilarity(memories, 0.3);
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('memory A');
        expect(result[1].text).toBe('memory B');
    });

    test('keeps at least one memory (memory desert protection)', () => {
        const result = filterBySimilarity(memories, 0.95);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('memory A'); // highest score
    });

    test('returns empty array when input is empty', () => {
        expect(filterBySimilarity([], 0.3)).toEqual([]);
    });
});

describe('deduplicate', () => {
    // Mock embedding function that returns predictable vectors
    const mockEmbedFn = async (text) => {
        const vectors = {
            'memory A': [1, 0, 0],
            'memory A copy': [0.99, 0.1, 0],     // ~0.99 cosine sim with A
            'memory B': [0, 1, 0],                // orthogonal to A
            'memory C': [0, 0, 1],                // orthogonal to A and B
        };
        return vectors[text] || [0.5, 0.5, 0.5];
    };

    test('removes near-duplicate memories (>85% similarity)', async () => {
        const memories = [
            { text: 'memory A', timestamp: 1000, score: 0.9 },
            { text: 'memory A copy', timestamp: 2000, score: 0.7 },
            { text: 'memory B', timestamp: 3000, score: 0.6 },
        ];
        const result = await deduplicate(memories, mockEmbedFn);
        expect(result).toHaveLength(2);
        expect(result.map(m => m.text)).toContain('memory A');
        expect(result.map(m => m.text)).toContain('memory B');
        expect(result.map(m => m.text)).not.toContain('memory A copy');
    });

    test('keeps all memories when none are duplicates', async () => {
        const memories = [
            { text: 'memory A', timestamp: 1000, score: 0.9 },
            { text: 'memory B', timestamp: 2000, score: 0.7 },
            { text: 'memory C', timestamp: 3000, score: 0.6 },
        ];
        const result = await deduplicate(memories, mockEmbedFn);
        expect(result).toHaveLength(3);
    });

    test('returns empty array for empty input', async () => {
        const result = await deduplicate([], mockEmbedFn);
        expect(result).toEqual([]);
    });

    test('returns single memory unchanged', async () => {
        const memories = [{ text: 'memory A', timestamp: 1000, score: 0.9 }];
        const result = await deduplicate(memories, mockEmbedFn);
        expect(result).toHaveLength(1);
    });
});
