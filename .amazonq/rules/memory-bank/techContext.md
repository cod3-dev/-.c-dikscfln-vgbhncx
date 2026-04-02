# Tech Context

## Monorepo Setup
- Root `package.json` uses **npm workspaces** (v0.1.0, name: `african-healthcare-platform`)
- Workspaces: `backend/gateway/api-gateway`, `backend/services/*`, `frontend/web`, `frontend/mobile`, `frontend/ussd`
- Root dev scripts: `dev` (all), `dev:backend` (all backend services), `dev:frontend` / `dev:web` (web only)
- npm scope: `@african-healthcare/*`

## Frontend Stack
| Package | Name | Technology | Status |
|---|---|---|---|
| `frontend/web` | `@african-healthcare/web` | Vanilla HTML + CSS + Node.js HTTP server | **Live** |
| `frontend/mobile` | `@african-healthcare/mobile` | React Native (planned) | Stub only |
| `frontend/ussd` | `@african-healthcare/ussd` | Custom flow engine (planned) | Stub only |
| `frontend/shared/design-system` | — | Custom component library | Not started |
| `frontend/shared/api-client` | — | Typed API client | Not started |
| `frontend/shared/state` | — | TBD (Redux / Zustand / Context) | Not started |

### Web Frontend Details
- Brand: **Afya CarePath**
- Server: custom `server.js` — Node.js `http` module, static file server, path traversal protection, configurable `PORT`
- Entry: `index.html` — full single-page layout (no framework, no bundler)
- JS: `src/app/main.js` — IntersectionObserver scroll-reveal
- CSS: `src/styles/main.css` — CSS custom properties design system, dark green palette (`--bg: #04110d`, `--accent: #52ffa8`), responsive at 1100px and 760px breakpoints
- No build step — runs directly with `node server.js`

## Backend Stack
| Package | Name | Status |
|---|---|---|
| `backend/gateway/api-gateway` | `@african-healthcare/api-gateway` | Stub only |
| `backend/services/triage-service` | `@african-healthcare/triage-service` | Stub only |
| `backend/services/facility-matching-service` | `@african-healthcare/facility-matching-service` | Stub only |
| `backend/services/appointment-service` | `@african-healthcare/appointment-service` | Stub only |
| `backend/services/cost-estimation-service` | `@african-healthcare/cost-estimation-service` | Stub only |
| `backend/services/ehr-service` | `@african-healthcare/ehr-service` | Stub only |
| `backend/services/telemedicine-service` | `@african-healthcare/telemedicine-service` | Stub only |
| `backend/services/notification-service` | `@african-healthcare/notification-service` | Stub only |

- All backend packages are at v0.1.0 with placeholder `dev` scripts
- Language: Node.js confirmed (npm workspaces); Python per-service still an option
- Auth: JWT + OAuth2 (planned, `backend/shared/auth/`)
- Triage Engine: Rules-based in `triage-service/rules/` (planned)

## Data Layer
| Store | Use Case | Status |
|---|---|---|
| PostgreSQL | Users, appointments, EHR, facilities, pricing | Not started |
| Redis | Sessions, caching, pub/sub, rate limiting | Not started |
| AWS S3 | Documents, lab reports, media files | Not started |

## External Integrations
| Integration | Purpose | Status |
|---|---|---|
| M-Pesa | Primary payment processing | Not started |
| Hospital Systems | Patient data sync, bed availability | Not started |
| Lab Systems | Lab order submission, result ingestion | Not started |
| Pharmacy Systems | Prescription routing and fulfillment | Not started |

## Infrastructure
- Cloud: AWS (S3 usage planned)
- Containerization: Docker/ECS or Kubernetes (TBD)
- CI/CD: TBD

## Testing Strategy
Each service has a `tests/` directory. Pattern suggests:
- Unit tests per service
- Integration tests for external integrations
- Frontend tests in `frontend/*/tests/`

## Key Constraints
- Must support low-bandwidth environments (USSD, SMS fallback)
- M-Pesa integration requires Safaricom Daraja API compliance
- Healthcare data requires HIPAA/local data protection compliance
- USSD sessions are stateless and time-limited (requires Redis session state)
- Web frontend has no bundler — keep JS/CSS vanilla or introduce a bundler before adding frameworks
