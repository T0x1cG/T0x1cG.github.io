# T0x1cG Portfolio

A self-contained cybersecurity portfolio with a protected publishing desk.

## Run locally

Run node server.js, then open http://localhost:3000.

## Publish content

1. Select Publishing Desk in the top-right corner.
2. On first use, set an administrator password (minimum 10 characters).
3. Add research/writeups, short notes, or certifications. Published entries are saved to data/content.json.

The password is stored only as a one-way scrypt hash in data/settings.json; that file is intentionally ignored by Git. Delete it only if you deliberately want to reset the desk password.

## Personalize

Update the contact email and GitHub link in index.html, then replace the seed entries using the Publishing Desk.
