import { describe, test, expect } from '@jest/globals';
import { filterBySimilarity, deduplicate, applyTimeDecay, compressMemories } from '../src/memory/memory-optimizer.js';

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

describe('applyTimeDecay', () => {
    const now = Date.now();
    const ONE_DAY_MS = 86400000;

    test('returns memories unchanged when halfLifeDays is null', () => {
        const memories = [
            { text: 'old', timestamp: now - 60 * ONE_DAY_MS, score: 0.9 },
            { text: 'new', timestamp: now - ONE_DAY_MS, score: 0.5 },
        ];
        const result = applyTimeDecay(memories, null, 'test query');
        expect(result[0].text).toBe('old');
        expect(result[1].text).toBe('new');
    });

    test('boosts recent memories over older ones with equal scores', () => {
        const memories = [
            { text: 'old', timestamp: now - 60 * ONE_DAY_MS, score: 0.8 },
            { text: 'new', timestamp: now - ONE_DAY_MS, score: 0.8 },
        ];
        const result = applyTimeDecay(memories, 30, 'test query');
        expect(result[0].text).toBe('new');
    });

    test('preserves original score field', () => {
        const memories = [
            { text: 'test', timestamp: now - 15 * ONE_DAY_MS, score: 0.7 },
        ];
        const result = applyTimeDecay(memories, 30, 'query');
        expect(result[0].score).toBe(0.7);
    });

    test('skips decay for atemporal queries', () => {
        const memories = [
            { text: 'old', timestamp: now - 90 * ONE_DAY_MS, score: 0.9 },
            { text: 'new', timestamp: now - ONE_DAY_MS, score: 0.5 },
        ];
        const result = applyTimeDecay(memories, 30, 'tell me everything about our history');
        expect(result[0].text).toBe('old');
    });

    test('skips decay for queries containing "always"', () => {
        const memories = [
            { text: 'old', timestamp: now - 90 * ONE_DAY_MS, score: 0.9 },
            { text: 'new', timestamp: now - ONE_DAY_MS, score: 0.5 },
        ];
        const result = applyTimeDecay(memories, 30, 'what do you always remember');
        expect(result[0].text).toBe('old');
    });
});

describe('compressMemories', () => {
    test('does not compress memories under 200 chars', () => {
        const memories = [
            { text: 'Short memory about cats.', timestamp: 1000, score: 0.9 },
        ];
        const result = compressMemories(memories, 'cats');
        expect(result[0].text).toBe('Short memory about cats.');
    });

    test('compresses long memories keeping query-relevant sentences', () => {
        const longText = 'The weather was sunny and warm today. ' +
            'We discussed the project roadmap in detail during the meeting. ' +
            'The team agreed on the next milestones for the project. ' +
            'Coffee was served at three o clock in the afternoon. ' +
            'The sunset was beautiful from the office window.';
        const memories = [{ text: longText, timestamp: 1000, score: 0.9 }];
        const result = compressMemories(memories, 'project roadmap milestones');
        // Compressed text should be shorter than original
        expect(result[0].text.length).toBeLessThan(longText.length);
        // Should keep project-related sentences
        expect(result[0].text).toContain('project');
    });

    test('does not compress single-sentence memories even if long', () => {
        const longSentence = 'A'.repeat(250);
        const memories = [{ text: longSentence, timestamp: 1000, score: 0.9 }];
        const result = compressMemories(memories, 'query');
        expect(result[0].text).toBe(longSentence);
    });

    test('returns empty array for empty input', () => {
        expect(compressMemories([], 'query')).toEqual([]);
    });

    test('preserves non-text fields', () => {
        const longText = 'First sentence about dogs. ' +
            'Second sentence about cats. ' +
            'Third sentence about birds. ' +
            'Fourth sentence about fish in the aquarium. ' +
            'Fifth sentence about hamsters running on their wheels.';
        const memories = [{
            text: longText,
            timestamp: 1000,
            score: 0.9,
            source: 'chat',
            chatId: 'abc',
        }];
        const result = compressMemories(memories, 'dogs');
        expect(result[0].timestamp).toBe(1000);
        expect(result[0].score).toBe(0.9);
        expect(result[0].source).toBe('chat');
        expect(result[0].chatId).toBe('abc');
    });
});
