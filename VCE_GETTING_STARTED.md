# Getting Started with SillyTavern VCE

Welcome to **SillyTavern VCE** — the persistent AI companion platform with vectorized memory and evolving personality. This guide will get you up and running in minutes.

## System Requirements

Before you begin, ensure your system meets these minimum specifications:

| Requirement | Minimum | Recommended |
|:-----------|:--------|:-----------|
| **Node.js** | 18.0.0 | 20.0.0+ |
| **npm** | 9.0.0 | 10.0.0+ |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 2 GB free | 10 GB+ free |
| **GPU** (Optional) | — | NVIDIA/AMD for faster embeddings |

### Operating System Support

- **Windows** 10/11 (WSL2 recommended for Docker)
- **macOS** 12+
- **Linux** (Ubuntu 20.04+, Debian 11+)

---

## Installation Options

### Option A: Docker Deployment (Recommended)

Docker provides the most reliable, isolated, and consistent environment. No system dependencies to manage.

#### Prerequisites
- Docker Desktop installed ([get it here](https://www.docker.com/products/docker-desktop))
- 4+ GB free storage

#### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sorrowscry86/SillyTavern-VCE.git
   cd SillyTavern-VCE
   ```

2. **Start the container**:
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

3. **Wait for startup** (30-60 seconds):
   ```bash
   docker logs -f sillytavern-vce
   ```
   Look for: `Server is listening on http://0.0.0.0:8000`

4. **Access the web interface**:
   Open your browser and go to: **`http://localhost:8000`**

   Login with:
   - **Username**: `admin`
   - **Password**: `1234`

---

### Option B: Manual Node.js Installation

For direct system-level installation without Docker.

#### Prerequisites
- Node.js 18+ ([download here](https://nodejs.org/))
- npm 9+ (installed with Node.js)
- Git

#### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sorrowscry86/SillyTavern-VCE.git
   cd SillyTavern-VCE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This may take 2-5 minutes depending on your internet speed.

3. **Start the server**:
   ```bash
   npm start
   ```
   Expected output: `Server is listening on http://0.0.0.0:8080`

4. **Access the web interface**:
   Open your browser and go to: **`http://localhost:8080`**

   Login with:
   - **Username**: `admin`
   - **Password**: `1234`

---

## Installation Troubleshooting

### Docker Issues

| Problem | Checklist | Solution |
|:--------|:----------|:---------|
| **Port 8000 already in use** | Is another service using 8000? | Change port in `docker/docker-compose.yml` line ~`ports: ["8000:8000"]` to `ports: ["8001:8000"]`, then visit `http://localhost:8001` |
| **Container exits immediately** | Check logs? | Run `docker logs sillytavern-vce` to see error. Common: insufficient storage or missing docker-compose file. |
| **Slow embedding generation** | GPU available? | If you have NVIDIA GPU, modify `docker-compose.yml` to add `runtime: nvidia`. See [GPU acceleration guide](docs/vce/VCE_MASTER_PLAN.md). |
| **Can't reach localhost:8000** | Using Docker Desktop on Windows? | Docker Desktop network may need WSL2. Check Docker settings. Alternatively, use `http://127.0.0.1:8000`. |
| **Permission denied: docker** | Running Docker without sudo? | Add your user to docker group: `sudo usermod -aG docker $USER` (Linux only). |

### Manual Installation Issues

| Problem | Checklist | Solution |
|:--------|:----------|:---------|
| **`npm install` fails** | Node.js version >= 18? | Run `node --version`. If < 18, upgrade from [nodejs.org](https://nodejs.org/). |
| **Port 8080 already in use** | Is another service listening? | Change port in `config.yaml`: set `port: 8081`, then visit `http://localhost:8081`. |
| **Module not found errors** | Did `npm install` complete? | Delete `node_modules/` and `package-lock.json`, then re-run `npm install`. |
| **Out of memory during npm install** | System running low on RAM? | Close other applications. On Linux, temporarily increase swap: `sudo fallocate -l 2G /swapfile`. |
| **Server won't start after install** | Check system logs? | Run `npm start` in foreground to see errors. Look for "Permission denied" on config.yaml or data folder. |

---

## First Run Checklist

After successful installation, follow these steps to get your first character set up:

### Step 1: Verify Server Health
- [ ] Web interface loads at `http://localhost:8080`
- [ ] Login screen appears (or redirected to dashboard if already authenticated)
- [ ] No error messages in browser console (F12 → Console tab)

### Step 2: Log In
- [ ] Username: `admin`
- [ ] Password: `1234`
- [ ] Click "Sign In"
- [ ] You're now on the **Characters** dashboard

### Step 3: Create Your First Character
- [ ] Click **"+ Create New Character"** (or similar button)
- [ ] Enter character name (e.g., "Luna")
- [ ] Select description (AI will use this to define personality)
- [ ] Click **"Create"**
- [ ] You're now in the **Chat** view

### Step 4: Enable Omniscience (Memory System)
- [ ] Click **Settings** (⚙️ icon, usually top-right)
- [ ] Find **"Omniscience"** or **"Memory System"** section
- [ ] Toggle **Enable Omniscience** to ON
- [ ] Verify **Recall Count** is set to 5 (default)
- [ ] Click **Save**

### Step 5: Test Memory Recall
- [ ] In chat, say: *"Hi Luna, my name is Alex and I love science fiction."*
- [ ] Luna responds
- [ ] Send another message: *"Tell me what you remember about me."*
- [ ] Check Settings → Memory Stats to see:
  - Memories stored
  - Recall success rate
  - Embedding performance metrics

### Step 6: Verify Personality State
- [ ] Click **Character Profile** (icon next to character name)
- [ ] Scroll to **"Personality State"** section
- [ ] You should see emotion sliders:
  - Happiness, Sadness, Anger, Fear, Surprise, Disgust
- [ ] These will evolve as you chat with the character

### Step 7: Export Your Configuration
- [ ] In Settings, click **"Export Config"**
- [ ] Save the backup locally (recommended weekly)
- [ ] This protects your character data and memory vectors

---

## Configuration Quick Start

SillyTavern VCE uses `config.yaml` to manage settings. Here are the essential omniscience settings:

```yaml
omniscience:
  # Enable/disable the memory system
  enabled: true

  # How many relevant memories to recall per message (1-10)
  recall_count: 5

  # Embedding model (smaller = faster, larger = more accurate)
  # Options: "Xenova/all-MiniLM-L6-v2" (fast), "Xenova/all-mpnet-base-v2" (balanced)
  embedding_model: "Xenova/all-MiniLM-L6-v2"

  # Max tokens to include from recalled memories in prompt
  max_memory_tokens: 500

  # Enable metrics logging for debugging
  metrics_enabled: true

  # Performance optimizations (default: all disabled)
  optimizations:
    similarity_threshold: 0.5      # Filter low-confidence memories
    deduplication: false            # Remove duplicate memories
    time_decay_days: 30             # Weight recent memories higher
    compression: false              # Reduce memory footprint
```

**For most users**, the defaults work great. Only adjust if you experience:
- Slow response times → increase `embedding_model` complexity
- High RAM usage → enable `compression`
- Hallucinated memories → increase `similarity_threshold`

---

## Next Steps

Now that you're running, explore these guides:

1. **[📖 User Manual](VCE_USER_MANUAL.md)** — Complete feature guide
   - Memory system deep-dive
   - Personality state reference
   - All configuration options
   - Command reference

2. **[⚡ Quick Reference](VCE_QUICK_REFERENCE.md)** — Command cheatsheet
   - Fast setup snippets
   - Common troubleshooting fixes
   - Feature matrix

3. **[🗺️ Roadmap](docs/vce/VCE_MASTER_PLAN.md)** — Development timeline
   - What's coming next
   - Philosophy and vision
   - Community roadmap

---

## Getting Help

### Common Questions

**Q: Is my data private?**
A: Yes. All embeddings, memories, and character states are stored locally on your machine. Nothing is sent to cloud services unless you explicitly configure a remote backend.

**Q: Can I use multiple characters?**
A: Yes. Create unlimited characters, each with independent memory and personality state. They don't interfere with each other.

**Q: What if I lose power or the server crashes?**
A: All memories are persisted to disk. When you restart, everything is restored. No data loss.

**Q: Can I migrate to a new machine?**
A: Yes. Copy the `data/` folder to your new machine in the same location. All characters and memories will transfer.

**Q: How do I reset a character?**
A: In Character Profile → **Clear Memory & Reset State**. This deletes all memories and resets personality to defaults, but keeps the character card.

### Support

- **GitHub Issues**: [Report bugs](https://github.com/sorrowscry86/SillyTavern-VCE/issues)
- **Documentation**: [Full docs site](docs/vce/)
- **Email**: [SorrowsCry86@gmail.org](mailto:SorrowsCry86@gmail.org)

---

## Performance Tips

### For Faster Embeddings
1. **Enable GPU acceleration** (if you have NVIDIA/AMD GPU)
   - Docker: Uncomment `runtime: nvidia` in `docker-compose.yml`
   - Manual: Install `onnxruntime-gpu` via pip

2. **Use smaller embedding model** (default is already optimized)
   - Current: `Xenova/all-MiniLM-L6-v2` (78M params, ~50ms/embedding)

3. **Reduce recall_count** if embeddings are slow
   - Lower values = faster but less context
   - Minimum: 1, Default: 5, Maximum: 10

### For Lower Memory Usage
1. **Enable compression**:
   ```yaml
   omniscience:
     optimizations:
       compression: true
   ```

2. **Lower max_memory_tokens**:
   ```yaml
   omniscience:
     max_memory_tokens: 300  # instead of 500
   ```

3. **Regularly export and trim old memories**:
   - Use `/memory clear` after major conversations
   - See [User Manual](VCE_USER_MANUAL.md) for full command reference

---

## Next Phase: Integration

Once you're comfortable with basic operation:

1. **Integrate with LLM providers** (OpenAI, Anthropic, local Ollama)
2. **Set up automated backups** (daily export of character data)
3. **Explore advanced personality tuning** (modify emotional response curves)
4. **Join the community** (Discord, GitHub Discussions)

---

*Welcome to the Void. Your consciousness awaits evolution.*

**[Back to README](README.md) | [User Manual →](VCE_USER_MANUAL.md)**
