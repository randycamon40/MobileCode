# MobileCode
Client-side code editor, terminal, npm and Git for Android Chrome (PWA). Preact + CodeMirror 6 + xterm.js + WebContainer + isomorphic-git.

## Setup
```
npm install
npm run dev      # http://localhost:5173 (COOP/COEP headers set in vite.config.js)
npm run build && npm run preview
```
Deploy `dist/` to Vercel (`vercel.json`) or Netlify (`netlify.toml`); both send COOP `same-origin` and COEP `require-corp`. Open over HTTPS, then use Chrome menu → Install app.

## Usage
Files tab: create/rename/delete. Editor: autosaves to IndexedDB after 500 ms; Run executes `.js` in a sandboxed iframe (console shown below). Preview: renders the active (or index) HTML with sandbox + CSP; same-folder `<script src>` tags are inlined. Terminal: `node -v`, `npm install <pkg>`, `npm run <script>`. Git: clone, commit, pull, push, branch switch.

## Limitations (be aware)
- WebContainer officially targets desktop Chromium; Android Chrome support is limited/unreliable. If boot fails, the app shows a notice and the rest keeps working.
- Git runs on a separate IndexedDB filesystem (LightningFS), synced from/to your project on clone, commit, pull, checkout. Edits made by terminal commands (e.g. npm install output) are not synced back to the editor/Git; `node_modules` is not committed unless you add it to the project files.
- Git hosts do not allow browser CORS on git endpoints, so clone/push/pull normally need a CORS proxy. The optional proxy field sends your token to that proxy: self-host one (e.g. @isomorphic-git/cors-proxy) and never use a public one with a real token. The app only accepts remote URLs on github.com, gitlab.com, bitbucket.org.
- 1 MB per file; text files only; pull is fast-forward only; no merge UI.
- Terminal Preview iframes use `sandbox="allow-scripts"` with a strict CSP (no network).

## Creating a PAT
- GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Contents: Read and write.
- GitLab: Preferences → Access Tokens → read_repository + write_repository.
- Bitbucket: Personal settings → App passwords → Repositories: Read, Write (use your Bitbucket username).

## Token security
Default is sessionStorage (gone when the tab closes). "Remember" stores AES-GCM ciphertext (PBKDF2, 250k iterations) in localStorage; the passphrase is never stored and is asked on each open. Logging goes through `safeLog()`, which redacts the token and any 31+ character alphanumeric string. Use a fine-grained token limited to one repo, rotate it every 30 days (a toast reminds you), and revoke it if the device is lost.
