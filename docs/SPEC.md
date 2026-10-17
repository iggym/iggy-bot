# IGGY/BOT — original build spec

Build a single-file, production-ready web application (`index.html`) that unifies the capabilities of Grok Bots, Meta Muse, OpenAI Dots, Claude Cowork, and Claude Code into a cohesive, agentic assistant interface.

### 1. Architectural & Technical Constraints
- **Stack:** Pure vanilla HTML5, CSS3, and modern ES6+ JavaScript contained entirely within a single `index.html` file. Zero external build steps, no package managers (npm/vite/webpack), and zero node module dependencies.
- **Visual Design System:** 
  - Background: Deep Void Black (`#080808` / `#0D0D0D`).
  - Accents: International Orange (`#FF4F00` / `#FF5500`).
  - Typography: `IBM Plex Mono` for code/logs and `Bebas Neue` or clean sans-serif for headers (imported via Google Fonts CDN).
  - Styling: Modern glassmorphism, subtle borders (`#222`), scannable layouts, and responsive panels.
- **Client Runtimes & CDNs:** Load interactive/motion libraries via CDN scripts:
  - GSAP (`https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`) for UI transitions.
  - Petite-Vue (`https://unpkg.com/petite-vue`) or native ES modules for reactive UI bindings.
- **API Architecture:** Directly invoke Gemini REST API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent`) or Groq REST API using streaming `fetch` with browser-native SSE buffer processing. Fallback gracefully to direct mock execution if no API key is set.

---

### 2. Functional Specification by Capability Core

#### A. Grok Bots (Custom Persona & Knowledge Management)
- **UI Element:** A dedicated Profile/Persona selector dropdown and configuration modal.
- **Behavior:** Store persona definitions (`name`, `system_prompt`, `knowledge_snippets`) in browser `localStorage`.
- **Execution:** Dynamically prepend selected persona system rules and scoped knowledge chunks into the LLM context request payload.

#### B. OpenAI Dots (Persistent Memory & Hybrid Search)
- **UI Element:** A side drawer displaying active "Stored User Facts & Context".
- **Behavior:** Maintain a persistent key-value/episodic store in `localStorage` or In-Memory IndexedDB.
- **Execution:** 
  - On input: Search stored memories via keyword match/semantic relevance and inject matching facts into a `<memory>` context tag.
  - Post-response: Automatically extract key user preferences/facts asynchronously and save them to memory.

#### C. Claude Cowork (Split-Pane Visual Workspace & Artifact Viewer)
- **UI Element:** A dual-pane canvas UI (Left: Conversational/Execution Stream; Right: Dynamic Workspace & Artifact Viewer).
- **Behavior:**
  - Parse incoming text streams for structured XML/Markdown blocks (e.g., `<artifact type="html|code|markdown" id="...">`).
  - Dynamically render previewable code artifacts on the right pane in real time using a sandboxed `<iframe>` (`srcdoc`) without interrupting chat streaming on the left.

#### D. Claude Code (Terminal, File System Simulation, & ReAct Loop)
- **UI Element:** A collapsible terminal drawer displaying active file logs, virtual directory trees, and command execution traces.
- **Behavior:** Implement a multi-step ReAct (Reasoning + Acting) loop:
  1. Parse tool calls (`read_file`, `write_file`, `execute_command`).
  2. Execute virtual file operations against an in-memory virtual file system (VFS).
  3. Feed file operation outputs back into the LLM context until the task criteria are satisfied.

#### E. Meta Muse (Proactive Task Engine & Background Queue)
- **UI Element:** A "Scheduled Goals & Background Tasks" management tab.
- **Behavior:**
  - Support multi-step background goal execution with dependency tracking (`task`, `dependencies`, `status`, `acceptance_criteria`).
  - Provide a Human-in-the-Loop Intercept Modal: Intercept high-risk or external operations (e.g., file overwrites, mock API payloads) with **Approve**, **Reject**, or **Edit** options before proceeding.
  - Support full state rollback/undo via a virtual pre-execution snapshot log.

---

### 3. Execution Code Blueprint Structure

Provide the complete `index.html` structure containing:
1. `<style>` block implementing the Void Black / International Orange design system and glassmorphic dual-pane layout.
2. Canvas markup featuring:
   - Header with API Key configuration, Persona selector, and Memory drawer toggle.
   - Left Pane: Chat stream, agent reasoning step logs, and terminal drawer.
   - Right Pane: Live Artifact Viewer iframe and interactive Virtual File System tree.
   - Human-in-the-Loop modal confirmation dialog.
3. `<script>` block containing:
   - Integrated VFS class.
   - Memory & Persona management engine.
   - Streaming SSE parser handling Gemini/Groq completions.
   - ReAct task decomposition and execution loop with retry logic and approval checkpoints.

Deliver a fully operational, self-contained `index.html` file with zero missing methods or placeholder shortcuts.