
import { configManager } from '../config-manager.js';

async function testMemory() {
    console.log('--- OMNISCIENCE VERIFICATION ---');

    // Initialize configManager to prevent logger from throwing
    configManager.initialize({ dataRoot: './test_data' });

    // Now import MemoryService dynamically
    const { MemoryService } = await import('./memory-service.js');

    const mockDirectories = {
        vectors: './test_vectors'
    };
    const characterName = 'Echo_Test';
    const memoryService = new MemoryService(mockDirectories, characterName);

    console.log('1. Initializing MemoryService...');
    await memoryService.init();

    console.log('2. Memorizing "Lord Wykeve Freeman is the Operator of Echo."...');
    await memoryService.memorize('Lord Wykeve Freeman is the Operator of Echo.', 'user');

    console.log('3. Memorizing "The Void vessel is currently active."...');
    await memoryService.memorize('The Void vessel is currently active.', 'system');

    console.log('4. Recalling memories for "Who is the Operator?"...');
    const results = await memoryService.recall('Who is the Operator?', 2);

    console.log('Results:', JSON.stringify(results, null, 2));

    if (results.some(r => r.text.includes('Lord Wykeve'))) {
        console.log('✅ RECALL SUCCESSFUL');
    } else {
        console.log('❌ RECALL FAILED');
    }
}

testMemory().catch(err => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
});
