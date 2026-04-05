# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |

## Reporting a Vulnerability

**Please do not open a public GitHub Issue for security vulnerabilities.**

Report security issues privately by:
- Opening a [GitHub Security Advisory](https://github.com/Bacon8tor/OpenClassBoard/security/advisories/new)
- Or contacting the maintainer via [Discord](https://discord.gg/KDfRFZ9YFe)

Include as much detail as possible: affected component, steps to reproduce, and potential impact.

You can expect an initial response within **72 hours**.

## Security Model

OpenClassBoard is a client-side React app. Key security considerations:

### Firebase
- Poll data is stored in Firebase Realtime Database
- Database rules restrict writes to active polls only and enforce vote immutability
- No authentication is required to vote — voter identity is tracked via a client-generated ID stored in localStorage
- Self-hosted deployments should review and deploy `firebase-database-rules.json`

### What Is and Isn't Protected
- ✅ HTML content in the Text widget is sanitized with DOMPurify
- ✅ Image URLs are validated to http/https only
- ✅ Firebase credentials must be provided via environment variables — never hardcoded
- ⚠️ Classroom layouts are stored in localStorage — treat as untrusted on shared devices
- ⚠️ Poll vote integrity relies on client-side voter IDs — not suitable for high-stakes voting

### Self-Hosting
- Always deploy behind HTTPS
- Set proper Firebase Database rules (see `firebase-database-rules.json`)
- Do not expose your `.env` file or commit it to version control
