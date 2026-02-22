import { describe, test, expect } from '@jest/globals';
import { filterBySimilarity } from '../src/memory/memory-optimizer.js';

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
