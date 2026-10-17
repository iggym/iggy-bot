# IGGY/BOT — personal agent

One `index.html`. Zero build. Zero cost. A personal AI agent that runs entirely in your browser, with five cores:

| Core | Inspired by | What it does here |
|---|---|---|
| **Personas** | Grok Bots | Custom bots: system prompt + knowledge snippets, ranked per prompt and scoped into `<knowledge>` |
| **Memory** | OpenAI Dots | Persistent facts about you, hybrid retrieval (BM25 + trigram), injected as `<memory>`, auto-extracted after each reply |
| **Workspace** | Claude Cowork | Split pane; `<artifact>` blocks stream live into a sandboxed iframe |
| **Code agent** | Claude Code | ReAct loop over a virtual file system, a shell (pipes, redirects, `&&`), and a `node` runtime in a Web Worker |
| **Goals** | Meta Muse | Background goals → dependent tasks with acceptance criteria → agent → verifier, with an approval gate and snapshot rollback |

## Get started in 60 seconds

1. **Open the app** — `https://iggym.github.io/iggy-bot/` (or open `index.html`).
2. **Get one free key** (no credit card for either):
   - **Google Gemini (recommended)** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → sign in with any Google account → **Create API key** → copy (starts with `AIza`).
   - **Groq (fastest)** — [console.groq.com/keys](https://console.groq.com/keys) → sign up → **Create API Key** → copy right away (starts with `gsk_`, shown once).
3. **Paste it** in the *Connect free AI* screen that opens on first visit (or tap **🔑 Free key** / the status pill anytime). The app sends one tiny test request and tells you in plain English if anything is wrong.

No key? Tap **Try the offline demo** — every subsystem is real; only the model is simulated.

Keys stay in your browser's `localStorage` and go only to the provider you pick. For a public or paid deployment, put a small proxy (e.g. a Cloudflare Worker) in front so the key never reaches the client.

## Try

- `Build a pomodoro timer app` — writes `/projects/…/index.html`, verifies it, renders a live artifact
- `Write a script that finds prime numbers and run it` — writes and runs JS in the sandboxed runtime
- `Send a webhook payload announcing the release` — triggers the approval intercept (simulated, never sent)
- `/goal Build a todo app and verify it` — background plan → execute → verify
- `/remember …`, `/run <cmd>`, `/undo`, `/help`

## Tool protocol

The model emits XML tool calls; observations are fed back until it answers without tools.

```xml
<tool name="read_file" path="/abs/path"/>
<tool name="list_files" path="/dir"/>
<tool name="write_file" path="/abs/path">FULL CONTENT</tool>
<tool name="execute_command">ls -l /src && node /src/main.js</tool>
<tool name="http_request" method="POST" url="https://…">body</tool>
<artifact type="html|markdown|code" id="kebab-id" title="Title">…</artifact>
```

Overwrites, `rm`/`mv`, overwriting redirects and `http_request` are **high risk** and pause for **Approve / Reject / Edit**. Every mutation is preceded by a file-system snapshot (↶ UNDO, per-task rollback, snapshot log).

## Repo layout

| Path | What |
|---|---|
| `index.html` | The whole app |
| `docs/SPEC.md` | The original build spec |
| `tests/smoke.js` | Headless smoke test (jsdom): every core in offline mode plus the key-setup flow. `cd tests && npm i && npm test` |
| `.github/workflows/pages.yml` | Publishes to GitHub Pages on every push to `main` |

## Deploy

- **GitHub Pages** — one-time: *Settings → Pages → Source: GitHub Actions*. The workflow does the rest.
- **Cloudflare Pages** — connect the repo, no build command, output directory `/`.

## Notes

- Default models: `gemini-2.5-flash` and `llama-3.3-70b-versatile`, both editable in ⚙ Settings.
- Gemini accepts direct browser calls. Browser (CORS) support for Groq is not guaranteed; if Groq fails to connect, the setup screen says so and points you to Gemini.
- `node` runs in a Web Worker and needs the page served over http(s).
- All state (chat, memory, personas, files, goals, snapshots) is per-browser. ⚙ → *Reset all data* clears it.
