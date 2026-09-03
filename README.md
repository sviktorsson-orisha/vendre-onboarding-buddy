# Vendre Lovable Template

A headless storefront template that connects to a Vendre store via Surface API v2.

## Kom igång / Get started

Open this project in Lovable and send any message (for example "kom igång").
The agent automatically runs the setup skill in `.vendre/skills/setup.md`,
which collects your Vendre credentials, configures CORS and verifies the
connection before any storefront code is written.

You will need, from Vendre Admin (Menu -> Apps & Integrations -> Headless):
- `VENDRE_BASE_URL`
- `VENDRE_CLIENT_ID`
- `VENDRE_CLIENT_SECRET`

Agent instructions live in `AGENTS.md`, knowledge in `.vendre/knowledge/`
and skills in `.vendre/skills/`.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vendre-onboarding-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b680686f-4945-4ee5-a18e-4b6fffe4e625).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Secrets och .env

`.env` innehåller endast **publika** värden (projekt-URL, projekt-ID och den
publicerbara nyckeln) och kan tryggt ligga i GitHub.

Lägg **aldrig** in `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`
eller service role-nyckeln i `.env` – de lagras i Lovables secrets och läses
bara server-side via `process.env`.
