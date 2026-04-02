# Active Context

## Current State
Project is in the **frontend-first phase**. The npm monorepo is bootstrapped and the web frontend (`frontend/web`) is the only package with real runtime code. All backend services and the API gateway have `package.json` stubs only — no source code yet.

## What Was Just Done
- npm workspaces monorepo configured at root (`package.json`) covering all backend services + frontend packages
- `frontend/web` fully implemented: vanilla HTML/CSS/JS static site served by a custom Node.js HTTP server (`server.js`)
  - Brand name confirmed: **Afya CarePath**
  - Sections: Hero, Services (Triage, Facility Matching, Cost Transparency, Telemedicine/EHR), Patient Journey (9 steps), Channels, Network, CTA
  - Responsive design with dark green/accent theme, scroll-reveal animations, floating stat cards
  - Runs on `PORT` env var or default `3000`
- `frontend/mobile` and `frontend/ussd` — package stubs only, no runtime code
- All backend service packages (`api-gateway`, `triage-service`, `facility-matching-service`, `cost-estimation-service`, `ehr-service`, `telemedicine-service`, `notification-service`, `appointment-service`) — package stubs only
- Memory Bank initialized

## Immediate Next Steps
Backend implementation is the priority. Logical order:

1. **Define shared contracts** (`backend/shared/contracts/`) — DTOs for User, Patient, Appointment, Facility, EHR Record, Notification
2. **Set up shared auth** (`backend/shared/auth/`) — JWT middleware, role definitions
3. **Bootstrap API gateway** (`backend/gateway/api-gateway/src/`) — Express routing, auth middleware, rate limiting
4. **Implement triage-service** — rules engine in `rules/`, symptom → urgency → care-level logic
5. **Implement facility-matching-service** — geolocation-based provider matching
6. **Implement appointment-service** — scheduling with calendar logic
7. **Implement cost-estimation-service** — pricing engine
8. **Implement ehr-service** — record CRUD with access controls
9. **Implement telemedicine-service** — WebRTC or similar session management
10. **Implement notification-service** — event-driven SMS/push/email dispatch
11. **Implement M-Pesa integration** (`backend/integrations/mpesa/`) — Daraja API wrapper
12. **Connect frontend to APIs** — wire `frontend/web` and build out `frontend/mobile` + `frontend/ussd`

## Active Decisions Needed
- Backend language per service (Node.js confirmed for gateway; Python vs Node for services?)
- State management for mobile (Redux / Zustand / Context)
- Telemedicine technology (WebRTC, Twilio, Agora, etc.)
- USSD gateway provider (Africa's Talking, etc.)
- Deployment target (ECS vs EKS vs Lambda)
- Database ORM/query builder (Prisma, Knex, Sequelize, etc.)

## Known Risks
- USSD session timeout (180s limit) constrains flow complexity
- M-Pesa Daraja API sandbox vs production environment differences
- Healthcare data compliance requirements may affect data residency choices
- Inter-service latency must be managed for real-time triage + matching flows
- Web frontend currently has no backend connection — all content is static placeholder copy
