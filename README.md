# T0x1cG Portfolio

A self-contained cybersecurity portfolio with a protected publishing desk.

The public interface uses full-screen panels: Home opens first, scrolling is locked, and the left-side index switches between Research, Notes, Credentials, and Contact.

## Run locally

Run node server.js, then open http://localhost:3000.

## Publish content

1. Select Publishing Desk in the top-right corner.
2. On first use, set an administrator password (minimum 10 characters).
3. Add research/writeups, short notes, or certifications. Published entries are saved to data/content.json.

Certificate and achievement posts can include a JPG, PNG, or WebP image directly from the Publishing Desk. The current credential gallery includes the original CC, CRTA, eJPT, and Cyber Arena 2026 images under assets/certificates.

The password is stored only as a one-way scrypt hash in data/settings.json; that file is intentionally ignored by Git. Delete it only if you deliberately want to reset the desk password.

When this folder is connected to the T0x1cG.github.io repository, the backend automatically commits data/content.json and pushes it to the main branch after every publish or removal. GitHub Pages then rebuilds the live site. The editor remains private on the laptop because GitHub Pages itself cannot execute Node.js.

## Personalize

Update the contact email and GitHub link in index.html, then replace the seed entries using the Publishing Desk.
