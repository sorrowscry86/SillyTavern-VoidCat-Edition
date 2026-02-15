# SillyTavern: AI Guidance & Repository Map

> [!IMPORTANT]
> This repository is a high-complexity Node.js/Express application with a Vanilla JS/jQuery SPA frontend. Follow these instructions strictly to maintain architectural integrity.

## Quick Start (The Surface)

### 1. Environment & Setup
- **Runtime**: Node.js >= 18.
- **Entry Point**: `server.js` (Backend), `public/index.html` (Frontend).
- **Start Command**: `npm start` or `Start.bat` (Windows).
- **Configuration**: `config.yaml` is generated in the root or data directory.

### 2. Core Directory Map
| Path | Purpose |
| :--- | :--- |
| `server.js` | Main entry point; boots the Express server. |
| `src/` | Backend source logic (endpoints, utilities, startup). |
| `public/` | Frontend assets (HTML, CSS, JS scripts). |
| `data/` | Default user data root (Characters, Chats, Settings). |
| `plugins/` | Server-side plugins. |
| `public/scripts/` | Modular frontend logic (UI handlers, API clients). |

---

## Deep Dive (The Ocean)

### 1. Backend Architecture (`src/`)
SillyTavern uses a modular Express setup.
- **`server-main.js`**: Orchestrates middleware, authentication (CSRF, Basic Auth), and static file serving.
- **`endpoints/`**: Contains provider-specific and feature-specific routers (e.g., `openai.js`, `characters.js`).
- **Prompt Logic**: `src/prompt-converters.js` is critical. It transforms internal chat states into format-specific strings for various LLMs.
- **User Management**: `src/users.js` handles data isolation and directory structures for multiple users (if enabled).

### 2. Frontend Architecture (`public/`)
The frontend is a massive SPA built with Vanilla JS and jQuery.
- **`script.js`**: The central hub. Most global functions and state are defined here.
- **`scripts/`**: Files here should be imported as ES modules into `script.js` or other modules.
- **Extension System**: Managed by `public/scripts/extensions.js`. It handles loading manifests and initializing third-party scripts.
- **Power User Settings**: `public/scripts/power-user.js` contains a large state object governing application behavior.

### 3. Data Flow
1. **Input**: User types in the frontend chat box.
2. **Processing**: `public/scripts/slash-commands/` handles command parsing.
3. **API Call**: The frontend sends a request to `/api/[provider]/generate`.
4. **Backend Transformation**: The backend endpoint (e.g., `src/endpoints/openai.js`) uses `prompt-converters.js` to prepare the payload.
5. **LLM Interaction**: The backend proxies the request to the external AI provider.
6. **Output**: The stream or JSON response is piped back to the frontend for rendering.

---

## Reference (The Abyss)

### Key Symbols & Constants
- `globalThis.DATA_ROOT`: Absolute path to the user data directory.
- `globalThis.COMMAND_LINE_ARGS`: Parsed CLI arguments.
- `eventSource` (Frontend): A global EventTarget used for decoupling UI components.

### Essential Development Scripts
- `npm run lint`: Runs ESLint across the codebase.
- `npm run debug`: Node debugging mode.
- `npm run plugins:update`: Helper for managing project plugins.

### VoidCat Standards for SillyTavern
- **Type Safety**: While mostly JS, use JSDoc for complex objects.
- **Modularity**: When adding features, create a new file in `src/endpoints/` (Backend) or `public/scripts/` (Frontend) rather than bloating `server-main.js` or `script.js`.
- **CSS**: Add styles to `public/style.css` using specific selectors to avoid pollution. Prefer CSS variables for themes.
