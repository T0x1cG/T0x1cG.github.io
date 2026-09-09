# Security controls

The public portfolio is a static GitHub Pages site. The private publishing backend is not included in this repository or deployed here.

- Article and Markdown links allow only HTTP, HTTPS, and mailto URLs, without embedded usernames or passwords.
- Markdown is escaped before rendering, and local documents are restricted to Markdown files under `assets/writeups/`.
- Downloaded HTB rank SVGs pass a strict geometry allowlist and are reserialized before publication. Scripts, events, styles, external references, XML declarations other than the optional XML header, and excessive input complexity are rejected. The workflow stops before publishing if validation fails.
- GitHub Actions are pinned to full commit IDs. Regression checks run on pushes and pull requests with read-only repository access.
- Study-note files and metadata have been removed from the current published tree. Earlier commits and third-party caches may still contain copies; history has not been rewritten.

## Framing limitation on GitHub Pages

The document starts with a hidden body. An early script reveals it only in a top-level window. Embedded views remain hidden and do not initialize the application. Blocking JavaScript leaves the body hidden, including when stylesheets are unavailable. Normal visitors need JavaScript enabled.

This is an application-level mitigation, not HTTP-level frame prevention. The `github.io` deployment does not supply a configurable `Content-Security-Policy: frame-ancestors 'none'` or `X-Frame-Options: DENY` response header. Complete browser-enforced frame rejection requires a hosting layer or custom-domain proxy that can send those headers. Adding them to HTML meta tags has no effect.

## Local verification

```sh
python3 scripts/test_sanitize_rank_svg.py
node scripts/check_public_content.mjs
node --check app.js
node --check frame-guard.js
```

Browser regression checks should cover malicious article URL schemes, normal navigation and readers, cross-origin framing, sandboxed frames with scripts enabled and disabled, and the hidden default when both JavaScript and CSS are unavailable.
