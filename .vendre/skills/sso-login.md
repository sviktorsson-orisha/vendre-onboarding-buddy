---
name: "vendre-sso-login"
description: "Use when implementing Google/Microsoft SSO authentication or magic login links."
---


## SSO & Passwordless Login Rules

- **Google SSO:** Initiate flow via `GET /surface/2/login/google-sso` (if enabled in Admin)[cite: 1, 2].
- **Microsoft SSO:** Initiate flow via `GET /surface/2/login/microsoft-sso` (if enabled in Admin)[cite: 1, 2].
- **Magic Login Links:** Trigger login email link via `POST /surface/2/login-link`[cite: 1, 2].
- **CORS Policy:** Ensure frontend origin is allowed under the `login` CORS policy tag[cite: 1, 2].