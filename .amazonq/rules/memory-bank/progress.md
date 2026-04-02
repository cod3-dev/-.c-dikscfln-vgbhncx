# Progress

## Status: Frontend Web Live — Backend Not Started

## What Works
- npm workspaces monorepo configured at root
- `frontend/web` — fully implemented static site (Afya CarePath brand)
  - Custom Node.js HTTP server (`server.js`) serving on configurable `PORT` (default 3000)
  - `index.html` — full landing page: hero, services, patient journey, channels, network, CTA
  - `src/app/main.js` — IntersectionObserver scroll-reveal animations
  - `src/styles/main.css` — complete dark-green design system with responsive breakpoints
- Memory Bank initialized and synced to workspace

## What's Pending (All Implementation)

### Backend
- [ ] `backend/shared/contracts/` — shared DTOs and event schemas
- [ ] `backend/shared/auth/` — JWT auth, RBAC middleware
- [ ] `backend/shared/middleware/` — logging, error handling, request validation
- [ ] `backend/shared/config/` — environment config loader
- [ ] `backend/shared/utils/` — common utilities
- [ ] `backend/gateway/api-gateway/src/` — routing, auth, rate limiting (package stub exists)
- [ ] `backend/services/triage-service/src/` — symptom assessment, rules engine (package stub exists)
- [ ] `backend/services/facility-matching-service/src/` — geo-based provider matching (package stub exists)
- [ ] `backend/services/appointment-service/src/` — scheduling, calendar, reminders (package stub exists)
- [ ] `backend/services/cost-estimation-service/src/` — pricing engine (package stub exists)
- [ ] `backend/services/ehr-service/src/` — health records CRUD (package stub exists)
- [ ] `backend/services/telemedicine-service/src/` — video/chat session management (package stub exists)
- [ ] `backend/services/notification-service/src/` — SMS, push, email dispatch (package stub exists)
- [ ] `backend/integrations/mpesa/` — Daraja API integration
- [ ] `backend/integrations/hospitals/` — hospital system connectors
- [ ] `backend/integrations/labs/` — lab system connectors
- [ ] `backend/integrations/pharmacies/` — pharmacy system connectors
- [ ] `backend/data/postgresql/` — schema migrations
- [ ] `backend/data/redis/` — cache and session config
- [ ] `backend/data/s3/` — bucket policies and file management

### Frontend
- [x] `frontend/web/` — static landing site live (Afya CarePath, vanilla HTML/CSS/JS + Node server)
- [ ] `frontend/web/` — wire to real backend APIs (currently all static placeholder content)
- [ ] `frontend/shared/design-system/` — component library
- [ ] `frontend/shared/api-client/` — typed API client
- [ ] `frontend/shared/state/` — global state management
- [ ] `frontend/shared/utils/` — shared utilities
- [ ] `frontend/mobile/` — React Native mobile app (package stub exists)
- [ ] `frontend/ussd/` — USSD flow engine and templates (package stub exists)

### Documentation
- [ ] `backend/docs/api/` — API documentation (OpenAPI/Swagger)
- [ ] `backend/docs/architecture/` — architecture decision records
- [ ] `frontend/docs/journeys/` — user journey documentation
- [ ] `frontend/docs/wireframes/` — UI wireframes

## Known Issues
- None yet (pre-implementation)

## Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| - | Microservices architecture | Independent scaling, team autonomy per domain |
| - | USSD channel included | Rural/low-tech user inclusion |
| - | M-Pesa as primary payment | Dominant payment rail in East Africa |
| - | PostgreSQL + Redis + S3 | Relational + cache + object storage covers all data needs |
| - | Shared contracts pattern | Prevents tight coupling between services |
