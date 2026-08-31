---
name: vendre-setup
description: Run FIRST in any newly imported or newly created Vendre project, before any other work, and whenever the user says "get started", "kom igång", "hur börjar jag", "connect to Vendre", or mentions Vendre API keys, OAuth client, client_secret, store URL or CORS. Drives the full connection setup and gates all storefront building until the connection test is green.
---

# Vendre setup (entry point)

This is the mandatory first procedure for this repository.

1. Read `.vendre/skills/setup.md` and follow it exactly, step by step.
2. Read `.vendre/knowledge/api-reference.md` (source of truth) and
   `.vendre/knowledge/general.md` before any API work.
3. Do not create storefront pages, components, product or cart features until
   the connection test returns `ok: true`.

Trigger conditions:
- The project was just imported or created from this template and the user
  sends their first message, whatever it is.
- The secrets `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`
  are not all present.
- The user asks how to get started, or mentions keys, OAuth, CORS or the store
  connection.
