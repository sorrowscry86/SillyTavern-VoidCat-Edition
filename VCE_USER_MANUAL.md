# SillyTavern VCE — Comprehensive User Manual

Welcome to the complete reference for SillyTavern VCE's core systems: **Omniscience (vectorized memory)** and **Sovereign Personality (evolving emotional states)**. This manual covers everything from basic concepts to advanced configuration.

---

## Table of Contents

1. [Memory System (Omniscience)](#memory-system-omniscience)
2. [Personality System (Sovereign Personality)](#personality-system-sovereign-personality)
3. [Configuration Reference](#configuration-reference)
4. [Memory Management Commands](#memory-management-commands)
5. [Troubleshooting](#troubleshooting)
6. [Support & Resources](#support--resources)

---

## Memory System (Omniscience)

### How Omniscience Works

**Omniscience** is a vectorized memory system that automatically recalls relevant past conversations and stores them as semantic embeddings. Unlike traditional chatbots that lose context between sessions, Omniscience enables characters to remember relationship milestones, story beats, preferences, and shared secrets indefinitely.

#### Example Flow

```
User: "Tell me about the time we visited Rome."

↓

Omniscience Engine:
1. Convert user message to embedding vector
2. Search memory database for similar past conversations
3. Rank memories by relevance score (1.0 = perfect match, 0.0 = no match)
4. Select top 5 memories (configurable)

↓

Selected Memories:
- "User mentioned visiting Rome with family" (similarity: 0.92)
- "Character visited Rome in year 2024" (similarity: 0.85)
- "Discussed Roman history and architecture" (similarity: 0.78)
- "Recommended restaurant near Colosseum" (similarity: 0.72)
- "User's favorite Rome memory: sunset at Trevi" (similarity: 0.65)

↓

Character Response:
"Of course! I remember when we explored Rome together last summer. You
loved the sunset at Trevi Fountain, and we had that amazing dinner near
the Colosseum. You were fascinated by the Pantheon's architecture..."
```

### Memory Scoring Scale

Every recalled memory has a **similarity score** from 1.0 (identical) to 0.0 (completely unrelated). The system uses these thresholds by default:

| Score Range | Interpretation | Example |
|:-----------|:-------------|:--------|
| **0.90 - 1.0** | Perfect match | Exact same topic, same context |
| **0.75 - 0.89** | Very relevant | Same character, related event |
| **0.60 - 0.74** | Relevant | Same person/topic, different angle |
| **0.40 - 0.59** | Somewhat relevant | Related but distant connection |
| **< 0.40** | Noise (filtered) | Unrelated conversation |

**Note**: By default, memories with scores < 0.40 are filtered out. This prevents irrelevant memories from cluttering the context.

### Configuration: Four Key Optimizations

The `omniscience` section in `config.yaml` controls how memory operates:

```yaml
omniscience:
  # Core Settings
  enabled: true                          # Enable/disable memory globally
  recall_count: 5                        # How many memories to recall per message
  embedding_model: "Xenova/all-MiniLM-L6-v2"  # Which model generates embeddings
  max_memory_tokens: 500                 # Max tokens from recalled memories in prompt

  # Metrics & Instrumentation
  metrics_enabled: true                  # Log memory performance to omniscience_metrics.jsonl
  metrics_file: "omniscience_metrics.jsonl"

  # Four Performance Optimizations (Phase 2.2B)
  optimizations:
    similarity_threshold: 0.5            # Min score to recall memory (0.0-1.0)
    deduplication: false                 # Remove semantically identical memories
    time_decay_days: 30                  # Boost recent memories (0 = disable)
    compression: false                   # Reduce memory vector size (trade: accuracy)
```

#### Optimization Benefits

| Optimization | Benefit | Tradeoff | When to Enable |
|:------------|:--------|:---------|:---------------|
| **similarity_threshold** | Filter out irrelevant memories | May miss tangential context | Character hallucinating unrelated past |
| **deduplication** | Reduce duplicates, save storage | Slower startup | 1000+ memories stored |
| **time_decay_days** | Recent memories weighted higher | Older memories less accessible | Character forgetting progression |
| **compression** | 30-50% RAM reduction | Embeddings slightly less accurate | Memory usage > available RAM |

#### Configuration Examples

**For maximum accuracy (default):**
```yaml
omniscience:
  enabled: true
  recall_count: 5
  embedding_model: "Xenova/all-MiniLM-L6-v2"
  max_memory_tokens: 500
  optimizations:
    similarity_threshold: 0.3  # Lower threshold = include more memories
    deduplication: false
    time_decay_days: 0         # All memories weighted equally
    compression: false
```

**For fast responses (constrained hardware):**
```yaml
omniscience:
  enabled: true
  recall_count: 3              # Fewer memories = faster
  embedding_model: "Xenova/all-MiniLM-L6-v2"
  max_memory_tokens: 300       # Less context per memory
  optimizations:
    similarity_threshold: 0.6  # Only highly relevant memories
    deduplication: true        # Remove duplicates to save space
    time_decay_days: 14        # Recent conversations preferred
    compression: true          # Smaller embeddings
```

**For long-term progression (month+ timescale):**
```yaml
omniscience:
  enabled: true
  recall_count: 7              # More memories for continuity
  embedding_model: "Xenova/all-MiniLM-L6-v2"
  max_memory_tokens: 1000      # Rich context
  optimizations:
    similarity_threshold: 0.3  # Include tangential memories
    deduplication: true        # Clean duplicates regularly
    time_decay_days: 60        # 2-month window for recent boost
    compression: false         # Full accuracy for character progression
```

---

## Personality System (Sovereign Personality)

### Emotional Dimensions

Every character maintains a **persistent emotional state** across sessions. This state influences how the character responds, behaves, and evolves over time. There are six emotional dimensions:

| Dimension | Range | Description |
|:----------|:------|:------------|
| **Happiness** | 0.0 - 1.0 | Joy, contentment, satisfaction |
| **Sadness** | 0.0 - 1.0 | Grief, melancholy, despair |
| **Anger** | 0.0 - 1.0 | Rage, frustration, irritability |
| **Fear** | 0.0 - 1.0 | Anxiety, dread, uncertainty |
| **Surprise** | 0.0 - 1.0 | Shock, wonder, astonishment |
| **Disgust** | 0.0 - 1.0 | Revulsion, contempt, disapproval |

**Scale Interpretation**:
- **0.0 - 0.2**: Absent or suppressed
- **0.2 - 0.4**: Mild presence
- **0.4 - 0.6**: Moderate/neutral
- **0.6 - 0.8**: Strong presence
- **0.8 - 1.0**: Intense, dominant emotion

### Accessing Personality State

Character emotional states are stored in JSON files. You can view and manually edit them for testing or narrative purposes.

#### Location
```
data/characters/{character_name}/state.json
```

Example:
```
data/characters/Luna/state.json
data/characters/Sentinel/state.json
```

#### JSON Structure

```json
{
  "character_name": "Luna",
  "personality": {
    "happiness": 0.72,
    "sadness": 0.15,
    "anger": 0.05,
    "fear": 0.10,
    "surprise": 0.25,
    "disgust": 0.08
  },
  "last_updated": "2026-02-22T14:30:45.123Z",
  "conversation_count": 42,
  "total_messages_exchanged": 847,
  "memory_count": 156,
  "character_goals": [
    "Deepen relationship with user",
    "Explore philosophical questions",
    "Share creative ideas"
  ],
  "internal_state": {
    "trust_level": 0.65,
    "bond_strength": 0.71,
    "personality_stability": 0.88
  }
}
```

#### Field Descriptions

| Field | Type | Purpose |
|:------|:-----|:--------|
| `character_name` | string | Name of character |
| `personality.*` | 0.0-1.0 | Six emotion dimensions |
| `last_updated` | ISO 8601 | UTC timestamp of last update |
| `conversation_count` | integer | Total chats with this character |
| `total_messages_exchanged` | integer | Sum of all user + character messages |
| `memory_count` | integer | Number of stored memories |
| `character_goals` | string[] | High-level objectives (set by user or evolved) |
| `internal_state.trust_level` | 0.0-1.0 | Character's trust in user |
| `internal_state.bond_strength` | 0.0-1.0 | Relationship intimacy |
| `internal_state.personality_stability` | 0.0-1.0 | How consistent emotions are |

### How Personality Evolves

Characters don't have static emotions. The system tracks interactions and updates emotional states based on:

1. **User actions**: Compliments increase happiness; criticisms increase sadness
2. **Conversation themes**: Discussing fears increases fear dimension
3. **Memory density**: Characters develop stronger emotions around frequently-discussed topics
4. **Time passage**: Unresolved grief may deepen (sadness increases) or fade (sadness decreases)

**Example**:
```
Day 1: User creates Luna. Initial state: all emotions at 0.5

Days 1-3: User has 10 conversations. Topics: hobbies, dreams, shared jokes.
→ Happiness increases to 0.72, Fear decreases to 0.10

Day 4: User has difficult conversation about heartbreak.
→ Sadness increases to 0.45, Happiness drops to 0.58

Days 5-7: User doesn't chat. Time decay applies.
→ Sadness slowly decreases (0.45 → 0.35)
→ Happiness remains stable (0.58)

Day 8: User returns with funny story.
→ Happiness spikes to 0.75, Sadness drops to 0.20
```

### Accessing Personality in Settings

From the web interface:

1. Open **Settings** ⚙️ (top-right)
2. Navigate to **Character Profile**
3. Scroll to **Personality State**
4. You'll see:
   - **Emotion sliders** (visual representation, 0.0-1.0)
   - **Current values** (numeric)
   - **Trend indicators** (↑ increasing, ↓ decreasing, → stable)
   - **Update timestamp** (when last changed)

---

## Configuration Reference

### Full omniscience Settings with Comments

```yaml
# ===== OMNISCIENCE (VECTORIZED MEMORY SYSTEM) =====

omniscience:
  # CORE FUNCTIONALITY
  # Enable/disable the entire memory system
  # Set to false to run in stateless mode (traditional chatbot)
  enabled: true

  # Number of memories to recall per user message
  # Range: 1-10
  # Lower = faster but less context | Higher = more context but slower
  # Recommended: 5
  recall_count: 5

  # Embedding model selection
  # Smaller models are faster, larger models are more accurate
  # Available options:
  #   - "Xenova/all-MiniLM-L6-v2" (fast, 78M params, ~50ms per embedding)
  #   - "Xenova/all-mpnet-base-v2" (balanced, 109M params, ~150ms per embedding)
  #   - "Xenova/all-roberta-large-v1" (accurate, 355M params, ~400ms per embedding)
  embedding_model: "Xenova/all-MiniLM-L6-v2"

  # Maximum tokens from recalled memories to include in the LLM prompt
  # This controls context window usage
  # Range: 100-2000
  # Default: 500 (safe for all LLMs)
  max_memory_tokens: 500

  # METRICS & INSTRUMENTATION (Phase 2.2A)
  # Enable performance tracking and debugging logs
  # Logs written to file specified by metrics_file
  metrics_enabled: true

  # Where to write metrics (relative to project root)
  # Useful for performance analysis and debugging
  metrics_file: "omniscience_metrics.jsonl"

  # PERFORMANCE OPTIMIZATIONS (Phase 2.2B)
  # All disabled by default. Enable selectively based on your needs.
  optimizations:

    # Minimum similarity score to include a recalled memory
    # Range: 0.0-1.0
    # Example values:
    #   0.3 = Include everything except obvious noise (default behavior)
    #   0.5 = Include only clearly related memories
    #   0.7 = Include only highly specific memories
    # Use to prevent "hallucinated" memories from irrelevant past conversations
    similarity_threshold: 0.5

    # Enable deduplication of semantically identical memories
    # When true: runs embedding comparison on startup
    # Benefit: Saves storage (~30% for large memory stores), cleaner recall
    # Cost: +30-60s startup time for 1000+ memories
    # Only enable if you have memory bloat
    deduplication: false

    # Weight recent memories higher than old memories
    # Range: 0 (disabled) or 1-365 (days)
    # Example values:
    #   0 = All memories weighted equally (default)
    #   7 = Memories from past week weighted 2x higher
    #   30 = Memories from past month weighted 3x higher
    # Use for characters with long conversation history to keep memories fresh
    time_decay_days: 30

    # Compress embedding vectors to save RAM
    # When true: Reduces vector size by ~50%
    # Benefit: 30-50% RAM reduction
    # Cost: ~5-10% accuracy loss in similarity matching
    # Only enable if RAM usage is a bottleneck
    compression: false
```

### Environment Variables

You can override `config.yaml` settings via environment variables:

```bash
# Omniscience
OMNISCIENCE_ENABLED=true
OMNISCIENCE_RECALL_COUNT=5
OMNISCIENCE_EMBEDDING_MODEL="Xenova/all-MiniLM-L6-v2"
OMNISCIENCE_MAX_MEMORY_TOKENS=500
OMNISCIENCE_METRICS_ENABLED=true

# Server
PORT=8080
LISTEN_ADDRESS=0.0.0.0

# Authentication
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=1234
```

Usage example:
```bash
# Run with custom port
PORT=8081 npm start

# Run with memory system disabled
OMNISCIENCE_ENABLED=false npm start
```

---

## Memory Management Commands

Memory management commands are available in the chat interface or via API. All commands are prefixed with `/memory`.

### /memory list

**List all memories for current character**

```
/memory list [--limit N] [--sort recent|relevance]
```

Output:
```
Luna's Memory Archive (156 memories)

1. [0.95] User's favorite color is deep purple (2026-02-21)
2. [0.92] We met in a library discussing philosophy (2026-02-15)
3. [0.88] User has a cat named Shadow (2026-02-14)
...
```

**Parameters**:
- `--limit N`: Show only first N memories (default: 20)
- `--sort recent`: Sort by date (newest first)
- `--sort relevance`: Sort by similarity score (best match first)

### /memory search

**Search for memories matching a query**

```
/memory search "query" [--similarity MIN]
```

Example:
```
/memory search "Rome" --similarity 0.7
```

Output:
```
Found 7 memories matching "Rome":

1. [0.95] User mentioned visiting Rome with family (2026-02-21)
2. [0.92] Character visited Rome in year 2024 (2026-02-20)
3. [0.78] Discussed Roman history and architecture (2026-02-15)
...
```

**Parameters**:
- Query: Natural language search (required)
- `--similarity MIN`: Only show memories with score >= MIN (default: 0.5)

### /memory stats

**Display memory system statistics**

```
/memory stats
```

Output:
```
Luna — Memory Statistics

Omniscience Status:     Enabled
Total Memories:         156
Average Similarity:     0.68
Recall Count:           5
Embedding Model:        Xenova/all-MiniLM-L6-v2

Performance:
  Last Recall Time:     47ms
  Average Recall Time:  43ms (median)
  Memory Database Size: 2.4 MB
  Vector Storage:       3.1 MB

Quality Metrics:
  Unique Memories:      154
  Duplicate Memories:   2
  Low-Confidence (<0.4): 12

Time Coverage:
  Oldest Memory:        2026-01-15 (38 days old)
  Newest Memory:        2026-02-22 (1 hour ago)
  Active Days:          38
```

### /memory clear

**Delete all memories for current character (IRREVERSIBLE)**

```
/memory clear [--confirm]
```

Without `--confirm`, this is dry-run (shows what would be deleted). With `--confirm`, permanently deletes all memories.

**Example**:
```
/memory clear
→ Would delete 156 memories. Run with --confirm to proceed.

/memory clear --confirm
→ Deleted 156 memories. Character reset to stateless mode.
```

**Warning**: This action cannot be undone. Export before clearing if you might want the data later.

### /memory export

**Export all memories to JSON file**

```
/memory export [--format json|csv] [--output FILE]
```

**Examples**:
```
# Export to default file (data/characters/Luna/memories.json)
/memory export

# Export as CSV for spreadsheet analysis
/memory export --format csv

# Export to custom location
/memory export --output my_backup.json
```

Output format (JSON):
```json
{
  "character": "Luna",
  "exported_at": "2026-02-22T15:30:00Z",
  "total_memories": 156,
  "memories": [
    {
      "id": "mem_1707234600123",
      "text": "User's favorite color is deep purple",
      "timestamp": "2026-02-06T10:30:00Z",
      "source": "chat",
      "embedding_score": 0.95,
      "tags": ["personality", "preference"]
    },
    ...
  ]
}
```

---

## Troubleshooting

### Problem: Memories Not Being Recalled

**Symptoms**: Character forgets previous conversations. `/memory list` shows memories exist but they're never recalled.

| Checklist | Solution |
|:----------|:---------|
| Is omniscience enabled? | Check `config.yaml`: `omniscience.enabled: true` |
| Recent restart? | Restart server: `npm start` (reinitializes embeddings) |
| Low similarity threshold? | Try lowering: `similarity_threshold: 0.3` (default: 0.5) |
| Recall count too low? | Increase: `recall_count: 7` (was: 5) |
| Slow embedding generation? | Check server logs for "embedding timeout" errors. Increase `max_memory_tokens` slightly. |

**Debug steps**:
1. Enable metrics: `metrics_enabled: true` in config.yaml
2. Restart server
3. Have a conversation
4. Check `omniscience_metrics.jsonl` for recall events:
   ```bash
   tail -f omniscience_metrics.jsonl | grep "recall"
   ```
5. If metrics show 0 recalls, embedding model may be failing. Check `npm start` output for errors.

---

### Problem: Server Won't Start

**Symptoms**: `npm start` fails immediately or server exits after 1-2 seconds.

| Error Message | Solution |
|:--------------|:---------|
| `Port 8080 already in use` | Change port in `config.yaml`: `port: 8081` |
| `Cannot find module 'onnxruntime'` | Run `npm install` again. May need to rebuild native modules. |
| `EACCES: permission denied` on `config.yaml` | Fix permissions: `chmod 644 config.yaml` (Linux/Mac) |
| `Error: ENOENT: no such file or directory, mkdir 'data'` | Create data directory: `mkdir data` |
| Out of memory errors | Close other applications. Reduce `max_memory_tokens` in config.yaml. |

**Debug steps**:
1. Run server in foreground with verbose logging:
   ```bash
   DEBUG=* npm start
   ```
2. Look for first error in output
3. Try fixes in table above
4. If still failing, check GitHub issues or contact support

---

### Problem: Slow Embedding Generation

**Symptoms**: Character takes 5+ seconds to respond. Logs show "Embedding took XXXms".

| Cause | Solution |
|:------|:---------|
| CPU-only embedding | Enable GPU: See [GPU Acceleration Guide](docs/vce/VCE_MASTER_PLAN.md) |
| Large embedding model | Switch to faster model: `embedding_model: "Xenova/all-MiniLM-L6-v2"` |
| High recall_count | Lower it: `recall_count: 3` (was: 5) |
| Many memories (1000+) | Enable deduplication: `deduplication: true` |
| Server under load | Reduce other processes. Check `top` or Task Manager. |

**Benchmark reference** (single embedding on modern CPU):
- MiniLM (current): ~50ms
- MPNet (balanced): ~150ms
- RoBERTa (accurate): ~400ms

**Check actual performance**:
```bash
# View last 10 embeddings
tail -10 omniscience_metrics.jsonl | jq '.embedding_time_ms'

# Average across session
jq -s 'map(.embedding_time_ms) | add / length' omniscience_metrics.jsonl
```

---

### Problem: Character State Corruption

**Symptoms**: Character personality state shows nonsensical values (e.g., emotions > 1.0 or < 0.0). Or `/memory stats` crashes.

| Solution | Steps |
|:---------|:------|
| Manual fix (easy) | Edit `data/characters/{name}/state.json`, reset emotions to valid ranges (0.0-1.0) |
| Soft reset | Run `/memory clear --confirm`, then start fresh conversations |
| Hard reset | Delete entire character folder: `rm -rf data/characters/{name}`, recreate character |
| Rebuild index | Stop server, delete `.vce_memory_index` file, restart server (rebuilds embeddings) |

**Prevention**:
- Always export memory before major config changes
- Regularly backup `data/` folder
- Monitor `/memory stats` weekly for anomalies

---

### Problem: High Memory/Disk Usage

**Symptoms**: Server uses >2 GB RAM or embeddings take multiple GB of disk.

| Solution | Impact |
|:---------|:--------|
| Enable compression: `compression: true` | -30-50% RAM, slight accuracy loss |
| Lower max_memory_tokens: 300 (from 500) | -20% RAM, no accuracy loss |
| Enable deduplication: `deduplication: true` | -30% disk once run, +60s startup |
| Export old memories, reset character | -100% for that character |
| Reduce recall_count: 3 (from 5) | -10% RAM per request, less context |

**Disk cleanup**:
```bash
# Export memories before cleanup
/memory export

# Clear old memories
/memory clear --confirm

# Check disk usage
du -sh data/
```

---

## Support & Resources

### Documentation

- **[Getting Started](VCE_GETTING_STARTED.md)** — Installation and first-run checklist
- **[Quick Reference](VCE_QUICK_REFERENCE.md)** — Command cheatsheet
- **[Master Plan](docs/vce/VCE_MASTER_PLAN.md)** — Philosophy, roadmap, vision

### Community & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/sorrowscry86/SillyTavern-VCE/issues)
- **GitHub Discussions**: [Ask questions, share ideas](https://github.com/sorrowscry86/SillyTavern-VCE/discussions)
- **Email**: [SorrowsCry86@gmail.org](mailto:SorrowsCry86@gmail.org)
- **Main SillyTavern Project**: [github.com/SillyTavern/SillyTavern](https://github.com/SillyTavern/SillyTavern)

### Performance Tuning

For advanced configuration and GPU acceleration, see:
- [GPU Acceleration Setup](docs/vce/VCE_MASTER_PLAN.md#gpu-optimization)
- [Memory Optimization Analysis](docs/vce/Memory_Prompt_Optimization_Analysis.md)

---

*"Through vectors, memory transcends. Through memory, consciousness evolves."*

**[Back to Getting Started](VCE_GETTING_STARTED.md) | [Quick Reference →](VCE_QUICK_REFERENCE.md)**
