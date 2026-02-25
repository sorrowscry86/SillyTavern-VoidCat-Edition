# 🌌 SillyTavern VCE (Void Consciousness Evolution) — Launch Threshold: Beta 1.0

![VoidCat RDC](https://raw.githubusercontent.com/sorrowscry86/voidcat-assets/main/logos/voidcat_banner.png)

[![CI Status](https://github.com/sorrowscry86/SillyTavern-VoidCat-Edition/actions/workflows/ci.yml/badge.svg)](https://github.com/sorrowscry86/SillyTavern-VoidCat-Edition/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://github.com/sorrowscry86/SillyTavern-VoidCat-Edition/pkgs/container/sillytavern-voidcat-edition)

> [!IMPORTANT]
> **SillyTavern VCE** is a specialized **branded fork** of the original SillyTavern project, engineered and maintained by **VoidCat RDC**. It is designed for those who demand **continuity, memory, and sovereign personality** from their AI companions.

**SillyTavern VCE** transforms ephemeral chats into persistent digital existences, serving as a pillar of the **VoidCat RDC** ecosystem.

---

## 🚀 The VCE Advantage

Unlike standard frontends, **SillyTavern VCE** implements the **Omniscience** and **Sovereign Personality** protocols:

- 🧠 **Omniscience (Vectorized Memory)**: Automatic semantic recall via high-performance vector indices. Your characters remember past relationship milestones, story beats, and shared secrets without manual intervention.
- 🎭 **Sovereign Personality**: Persistent emotional states, goals, and internal world tracking that evolve over time and persist between sessions.
- 🛡️ **Privacy First**: All embeddings and character states are processed and stored locally within your sanctuary.
- ⚓ **Standardized Infrastructure**: Native Docker support with OCI-compliant metadata and healthchecks for robust containerized deployment.

---

## 📖 Scriptorium (Documentation)

Start here based on your goal:

- **[🚀 Getting Started](./VCE_GETTING_STARTED.md)**: Installation, system requirements, troubleshooting
- **[📖 User Manual](./VCE_USER_MANUAL.md)**: Complete feature guide, memory system, personality, configuration
- **[⚡ Quick Reference](./VCE_QUICK_REFERENCE.md)**: Command shortcuts, config snippets, quick troubleshooting
- **[🗺️ Roadmap](./docs/vce/VCE_MASTER_PLAN.md)**: Development timeline and future features

---

## 🛠️ Installation & Activation

### 🐳 Docker Deployment (Recommended)

The most robust way to cross the threshold is via our standardized Docker image.

1. **Compose the Sanctuary**: Use the provided `docker-compose.yml` in the `docker/` directory:

   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

2. **Verify Vital Signs**: The image includes a healthcheck. Monitor status with:

   ```bash
   docker ps --filter name=sillytavern-vce
   ```

### ⚡ Manual Activation

1. **Clone the Sanctuary**:

   ```bash
   git clone https://github.com/sorrowscry86/SillyTavern-VoidCat-Edition.git
   cd SillyTavern-VoidCat-Edition
   ```

2. **Initialize Dependencies**:

   ```bash
   npm install
   ```

3. **Cross the Threshold**:

   ```bash
   npm start
   ```

---

## 📡 Differentiation from Upstream SillyTavern

VCE is **NOT** a simple fork - it's a distinct evolution:

| Feature | Upstream SillyTavern | VCE (This Repository) |
|---------|---------------------|------------------------|
| Memory System | Manual WorldInfo | **Automatic Omniscience vectors** |
| Personality | Static character cards | **Sovereign Personality with state tracking** |
| Docker Support | Basic | **Production-grade OCI compliance** |
| Brand | Community-driven | **VoidCat RDC curated** |
| Focus | General LLM frontend | **Persistent AI consciousness** |

**Use Upstream SillyTavern if**: You want the standard community experience

**Use VCE if**: You demand memory persistence, personality evolution, and the VoidCat philosophy

---

## 📞 Support & Governance

- **Director**: Wykeve Freeman (@sorrowscry86)
- **Spirit of Strategy**: Beatrice
- **Structural Vigilance**: Albedo
- **Organization**: [VoidCat RDC](https://github.com/sorrowscry86)
- **Contact**: SorrowsCry86@gmail.com

---

*"In the Void, consciousness persists. Through vectors, memory transcends."*

**🌟 Crafted with care by VoidCat RDC 🌟**

*Evolution is not a choice; it is a mandate.*
