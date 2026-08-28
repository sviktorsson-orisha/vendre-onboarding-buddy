# Surface API Technical Reference

Complete technical reference for all Surface API endpoints (`/surface/1/*` and `/surface/2/*`).

_Source: Static code analysis of `cadre/application/Routes/Http/SurfaceApi/**` and `cadre/application/Http/Controllers/SurfaceApi/**` (branch `2026_project_phoenix`). A machine-generated OpenAPI 3.2 document is also available live at `GET /surface/1/openapi` (use query `?v=1` or `?v=2` to filter by version)._

---

## 1. Global Rules

_(Applies to all endpoints unless specified otherwise)_

### 1.1 Base URL and Versioning

- **v1:** Base path `/surface/1/`
- **v2:** Base path `/surface/2/`

### 1.2 Session Cookie (`visitorid`)

All Surface requests require a valid store session cookie (`visitorid`) matching a row in the database, **except**:

- `POST /surface/2/oauth/token`
- `POST /surface/2/oauth/revoke`
- `POST /surface/2/session/bootstrap` _(creates the session)_

### 1.3 OAuth Bearer Token (v2 Only)

- **v1:** Never requires an OAuth bearer token.
- **v2:** Always requires `Authorization: Bearer <token>`, **except**:
  - `POST /surface/2/oauth/token`
  - `POST /surface/2/oauth/revoke`

_Validated globally in `includes/application_top.php` (choke point). Invalid or missing token returns `401` before the controller is executed._

### 1.4 CORS Policy

Each controller (or its base class) has the attribute `#[CorsPolicy('policy-name')]`. The policy name determines allowed origins configured under **Admin → Headless → CORS** (`SURFACE_CORS_ORIGINS` / `SURFACE_CORS_POLICIES`). Having CORS permission is required for cross-origin browser requests, but is distinct from `crights` or mutation tokens.

### 1.5 Crights (Store Feature Flags)

Feature flags checked via the global `crights(CRIGHT_X)` function on two levels:

- **Endpoint level (Router Gate):** Evaluated in the router constructor. If the cright is missing, the route is never registered $\rightarrow$ returns `404`.
- **Field/Behavior level:** Evaluated inside the controller body. Controls specific branches, response fields, or accepted body fields.

### 1.6 Mutation-Protection-Token

- **Header:** `Surface-Mutation-Protection-Token`
- Issued by `POST /surface/2/session/bootstrap` and rotated upon login/logout.
- Validation occurs **only** if the controller explicitly calls `$this->validateMutationProtectionIfCrossOrigin()`. Same-origin (server-to-server or frontend on the same domain) requests pass without a token. If an endpoint does not call this method, cross-origin mutating requests might lack this protection unless explicitly added in code.

### 1.7 Error Format

Errors are returned using the standard format:

```json
{
  "errors": [
    {
      "id": "string",
      "status": "string",
      "code": "string",
      "title": "string",
      "detail": "string",
      "source": {
        "pointer": "string",
        "parameter": "string",
        "header": "string"
      }
    }
  ]
}
```
