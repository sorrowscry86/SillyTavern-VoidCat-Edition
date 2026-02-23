# SillyTavern VCE — Quick Reference

**For experienced users who know what they need.** Minimal explanation, maximum signal.

---

## Installation (30 Seconds)

### Docker (Recommended)
```bash
git clone https://github.com/sorrowscry86/SillyTavern-VCE.git
cd SillyTavern-VCE
docker compose -f docker/docker-compose.yml up -d
# Visit http://localhost:8080 | Login: admin / 1234
```

### Local Node.js
```bash
git clone https://github.com/sorrowscry86/SillyTavern-VCE.git
cd SillyTavern-VCE
npm install
npm start
# Visit http://localhost:8080 | Login: admin / 1234
```

---

## Key Config Settings

**File**: `config.yaml`

```yaml
# Server
port: 8080
listen: true
listenAddress:
  ipv4: 0.0.0.0

# Authentication
basicAuthMode: true
basicAuthUser:
  username: "admin"
  password: "1234"

# Omniscience (Memory System)
omniscience:
  enabled: true
  recall_count: 5                 # How many memories to recall (1-10)
  embedding_model: "Xenova/all-MiniLM-L6-v2"  # Model choice
  max_memory_tokens: 500          # Context window allocation
  metrics_enabled: true
  optimizations:
    similarity_threshold: 0.5     # Filter low-relevance memories
    deduplication: false          # Remove duplicates
    time_decay_days: 30           # Boost recent memories
    compression: false            # Reduce vector size
```

**Override via env vars**: `PORT=8081 npm start`, `OMNISCIENCE_RECALL_COUNT=7 npm start`

---

## Commands

### Memory Commands

| Command | Purpose | Output |
|:--------|:--------|:-------|
| `/memory list [--limit 10]` | List all memories (newest first) | 156 memories (Luna) |
| `/memory search "query"` | Find memories by content | Results with similarity scores |
| `/memory stats` | Show memory stats & performance | Total memories, avg recall time, duplicate count |
| `/memory clear --confirm` | **Permanently delete all memories** | Deleted X memories |
| `/memory export [--format json\|csv]` | Backup all memories | JSON or CSV file |

---

## Quick Troubleshooting

| Problem | Quick Fix | Prevention |
|:--------|:----------|:-----------|
| **Port 8080 in use** | Change `port: 8081` in config.yaml | Check `netstat -an \| grep 8080` first |
| **Module not found** | `rm -rf node_modules/ package-lock.json && npm install` | Don't manually delete files in node_modules |
| **Memories not recalled** | Check `omniscience.enabled: true` | Run `/memory stats` weekly |
| **Slow responses** | Enable compression: `compression: true` | Lower `recall_count: 3` for low-RAM systems |
| **Character state broken** | Edit `data/characters/{name}/state.json` directly | Regular backups of `data/` folder |
| **Container won't start** | Run `docker logs sillytavern-vce` | Check Docker resources in settings |

---

## Feature Matrix

| Feature | Status | Config Key | Notes |
|:--------|:-------|:-----------|:------|
| **Vectorized Memory (Omniscience)** | ✓ Live | `omniscience.enabled` | Semantic recall, cross-session persistence |
| **Emotional State Tracking** | ✓ Live | N/A (automatic) | 6 dimensions: happiness, sadness, anger, fear, surprise, disgust |
| **Memory Optimization** | ✓ Live | `omniscience.optimizations.*` | Threshold, dedup, decay, compression all available |
| **Metrics & Instrumentation** | ✓ Live | `metrics_enabled` | JSONL file for perf analysis |
| **GPU Acceleration** | ✓ Docker only | `runtime: nvidia` | Requires NVIDIA GPU and docker-compose modification |
| **Multi-Character Support** | ✓ Live | N/A | Unlimited characters, independent memories |
| **Memory Export/Import** | ✓ Live | `/memory export` | JSON and CSV formats |

---

## Environment Variables

```bash
# Server
PORT=8080                              # Override listen port
LISTEN_ADDRESS=0.0.0.0                # Bind address

# Auth
BASIC_AUTH_USER=admin                 # Username
BASIC_AUTH_PASSWORD=1234              # Password

# Omniscience
OMNISCIENCE_ENABLED=true              # Enable/disable memory
OMNISCIENCE_RECALL_COUNT=5            # Memories per message
OMNISCIENCE_EMBEDDING_MODEL="..."     # Model selection
OMNISCIENCE_MAX_MEMORY_TOKENS=500     # Context allocation
```

---

## Common Workflows

### First-Time Setup
```bash
npm install && npm start
# → Visit http://localhost:8080
# → Login: admin/1234
# → Create character
# → Enable Omniscience in Settings
# → Test with `/memory stats`
```

### Performance Tuning for Low-Spec Hardware
```yaml
omniscience:
  recall_count: 2                # Fewer memories
  max_memory_tokens: 250         # Smaller context
  optimizations:
    similarity_threshold: 0.6    # Strict relevance
    time_decay_days: 7           # Recent focus
    compression: true            # Save RAM
```

### Long-Term Progression (Month+ Timescale)
```yaml
omniscience:
  recall_count: 8                # More memories for continuity
  max_memory_tokens: 1000        # Rich context
  optimizations:
    similarity_threshold: 0.3    # Include tangential
    time_decay_days: 60          # 2-month window
    deduplication: true          # Clean duplicates
    compression: false           # Full accuracy
```

### Backup Strategy
```bash
# Daily
/memory export
# → Saves data/characters/{name}/memories.json

# Weekly
cp -r data/ data_backup_$(date +%Y%m%d)/

# Before major updates
git stash
git pull origin main
npm install
npm start
```

---

## Performance Benchmarks

**Hardware**: Modern CPU (Ryzen 5 / i7), 8GB RAM, SSD

| Model | Embedding Time | Accuracy | RAM Usage |
|:------|:---------------|:---------|:----------|
| MiniLM (default) | ~50ms | Good (0.70 avg score) | ~200MB for 1000 memories |
| MPNet | ~150ms | Very Good | ~300MB |
| RoBERTa | ~400ms | Excellent | ~800MB |

**With optimizations enabled** (time_decay + compression):
- Embedding time: -0% (only vector storage reduced)
- RAM usage: -50%
- Recall accuracy: -5%

---

## API Endpoints

For developers integrating with external systems:

```
GET  /api/characters                    # List all characters
POST /api/characters                    # Create character
GET  /api/characters/{name}            # Get character data
POST /api/characters/{name}/chat       # Send message
GET  /api/characters/{name}/memories   # List memories
POST /api/characters/{name}/memories   # Add memory manually
GET  /api/characters/{name}/state      # Get personality state
PATCH /api/characters/{name}/state    # Update personality state
```

**Authentication**: Basic Auth (username: admin, password: 1234)

---

## Useful Files

| Path | Purpose |
|:-----|:--------|
| `config.yaml` | Main configuration |
| `data/characters/{name}/state.json` | Personality state (editable) |
| `data/characters/{name}/memories/` | Memory vectors (read-only) |
| `omniscience_metrics.jsonl` | Performance metrics |
| `docker-compose.yml` | Docker configuration |
| `.env` or `.env.local` | Secrets (not committed) |

---

## Links

- **[Getting Started](VCE_GETTING_STARTED.md)** — Installation & first run
- **[User Manual](VCE_USER_MANUAL.md)** — Full feature guide
- **[Master Plan](docs/vce/VCE_MASTER_PLAN.md)** — Roadmap & philosophy
- **[GitHub Repo](https://github.com/sorrowscry86/SillyTavern-VCE)** — Source code
- **[Issues](https://github.com/sorrowscry86/SillyTavern-VCE/issues)** — Bug reports & features

---

**Need more detail?** See [User Manual](VCE_USER_MANUAL.md) | **New to VCE?** See [Getting Started](VCE_GETTING_STARTED.md)
