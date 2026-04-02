# Progress

## Status: Scaffolding Complete — Implementation Not Started

## What Works
- Project directory structure established
- Memory Bank initialized

## What's Pending (All Implementation)

### Backend
- [ ] `backend/shared/contracts/` — shared DTOs and event schemas
- [ ] `backend/shared/auth/` — JWT auth, RBAC middleware
- [ ] `backend/shared/middleware/` — logging, error handling, request validation
- [ ] `backend/shared/config/` — environment config loader
- [ ] `backend/shared/utils/` — common utilities
- [ ] `backend/gateway/api-gateway/` — routing, auth, rate limiting
- [ ] `backend/services/triage-service/` — symptom assessment, rules engine
- [ ] `backend/services/facility-matching-service/` — geo-based provider matching
- [ ] `backend/services/appointment-service/` — scheduling, calendar, reminders
- [ ] `backend/services/cost-estimation-service/` — pricing engine
- [ ] `backend/services/ehr-service/` — health records CRUD
- [ ] `backend/services/telemedicine-service/` — video/chat session management
- [ ] `backend/services/notification-service/` — SMS, push, email dispatch
- [ ] `backend/integrations/mpesa/` — Daraja API integration
- [ ] `backend/integrations/hospitals/` — hospital system connectors
- [ ] `backend/integrations/labs/` — lab system connectors
- [ ] `backend/integrations/pharmacies/` — pharmacy system connectors
- [ ] `backend/data/postgresql/` — schema migrations
- [ ] `backend/data/redis/` — cache and session config
- [ ] `backend/data/s3/` — bucket policies and file management

### Frontend
- [ ] `frontend/shared/design-system/` — component library
- [ ] `frontend/shared/api-client/` — typed API client
- [ ] `frontend/shared/state/` — global state management
- [ ] `frontend/shared/utils/` — shared utilities
- [ ] `frontend/web/` — React web application
- [ ] `frontend/mobile/` — React Native mobile app
- [ ] `frontend/ussd/` — USSD flow engine and templates

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
