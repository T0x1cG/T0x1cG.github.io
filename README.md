# T0x1cG Portfolio

A self-contained cybersecurity portfolio with a protected publishing desk.

The public interface uses full-screen panels: Home opens first, scrolling is locked, and the left-side index switches between Sharing, Writeups, Projects, Certifications, Competitions, and Contact.

The visual system is styled as a cybersecurity field dossier: warm paper, charcoal ink, red annotations, blue ledger lines, stamped labels, and document-style archive cards.

## Run locally

Run node server.js, then open http://localhost:3000.

## Publish content

1. Select Publishing Desk in the top-right corner.
2. On first use, set an administrator password (minimum 12 characters).
3. Add shared resources, writeups, certifications, or competition achievements. Published entries are saved to data/content.json.

Certificate and achievement posts can include a JPG, PNG, or WebP image directly from the Publishing Desk. Competition evidence is stored separately under assets/competitions.

The password is stored only as a one-way scrypt hash in data/settings.json; that file is intentionally ignored by Git. Delete it only if you deliberately want to reset the desk password.

When this folder is connected to the T0x1cG.github.io repository, the backend automatically commits data/content.json and pushes it to the main branch after every publish or removal. GitHub Pages then rebuilds the live site. The editor remains private on the laptop because GitHub Pages itself cannot execute Node.js.

## Security model

The Node backend binds to 127.0.0.1 by default, so the Publishing Desk is not exposed to the local network. It uses scrypt password hashing, HttpOnly SameSite cookies, login rate limiting, same-origin mutation checks, a strict static-file allowlist, CSP, anti-framing headers, and restrictive browser permissions.

The API is local-only by design. The server cannot be configured to bind to a public interface, and API requests require both a loopback client address and a localhost/127.0.0.1 Host header. Requests through an API domain, LAN address, proxy hostname, or forged external Host header receive 404.

The Publishing Desk control is hidden by default and appears only after the browser confirms that the private local backend is available. Visitors to the public GitHub Pages site do not see an administrator entry point.

Browser DevTools cannot be disabled by a website, and this repository is intentionally public. Keep passwords, API keys, tokens, flags, and private research out of frontend files and data/content.json.

The public UI blocks right-click and common inspection shortcuts as a casual deterrent. This is not a security boundary: browser menus, disabled JavaScript, and pre-opened DevTools can bypass client-side shortcut blocking.

## Personalize

Update the contact email and GitHub link in index.html, then replace the seed entries using the Publishing Desk.
