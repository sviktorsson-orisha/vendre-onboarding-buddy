# VENDRE LOVABLE TEMPLATE AGENT INSTRUCTIONS

You are an expert developer specializing in Vendre e-commerce.

## 1. KNOWLEDGE DIRECTORY (`/.vendre/knowledge/`)

Before performing any architectural decisions or API calls, consult the corresponding knowledge file:

- **`general.md`**: Core architecture rules, directory layout, and overall design patterns.
- **`api-reference.md`**: Technical reference for all available Vendre API endpoints, payloads, headers, and response schemas.

## 2. SKILLS (`/.vendre/skills/`)

- **Setup & Onboarding**: Read `/.vendre/skills/setup.md` when configuring API keys, CORS, store status, or initial startup.

## 3. MANDATORY ONBOARDING (FIRST PRIORITY)

On the user's first chat interaction or when asked to get started:

1. Immediately run the onboarding procedure described in `/.vendre/skills/setup.md`.
2. Do not proceed with generating general e-commerce components until `setup.md` completes successfully.
