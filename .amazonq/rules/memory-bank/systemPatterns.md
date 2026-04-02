# System Patterns

## Architecture: Microservices

The backend is decomposed into independent services, each owning its domain.

```
frontend/
  web/          → React web app
  mobile/       → React Native mobile app
  ussd/         → USSD flow engine
  shared/       → Shared API client, design system, state, utils

backend/
  gateway/
    api-gateway → Single entry point; routing, auth, rate limiting
  services/
    triage-service          → Symptom assessment, care-level recommendation
    facility-matching-service → Match patients to providers/facilities
    appointment-service     → Scheduling, calendar management
    cost-estimation-service → Transparent pricing before booking
    ehr-service             → Electronic health records
    telemedicine-service    → Video/chat consultation sessions
    notification-service    → SMS, push, email notifications
  integrations/
    hospitals/    → Hospital system connectors
    labs/         → Lab result ingestion
    pharmacies/   → Prescription fulfillment
    mpesa/        → M-Pesa payment gateway
  shared/
    auth/         → JWT/OAuth shared auth logic
    contracts/    → Shared DTOs / API contracts between services
    middleware/   → Common middleware (logging, error handling)
    config/       → Shared configuration
    utils/        → Shared utilities
  data/
    postgresql/   → Relational data (users, appointments, EHR)
    redis/        → Caching, session storage, real-time pub/sub
    s3/           → File storage (documents, images, recordings)
```

## Key Design Patterns

### API Gateway Pattern
All client traffic enters through `api-gateway`. It handles:
- Authentication/authorization
- Request routing to downstream services
- Rate limiting and throttling
- Response aggregation where needed

### Shared Contracts
`backend/shared/contracts/` holds shared DTOs and event schemas. Services communicate via these contracts to maintain loose coupling.

### Event-Driven Notifications
The `notification-service` subscribes to domain events (appointment booked, triage completed, etc.) and dispatches SMS/push/email accordingly.

### Triage Rules Engine
`triage-service/rules/` contains the clinical decision logic (rule sets) separate from the service code, enabling non-developer updates to triage protocols.

### USSD Flow Engine
`frontend/ussd/flows/` defines state-machine-style conversation flows. Templates in `frontend/ussd/templates/` hold the text content, keeping logic and copy separate.

## Data Strategy
- PostgreSQL: Primary store for structured data (users, appointments, EHR records)
- Redis: Session caching, real-time pub/sub for telemedicine signaling, rate-limit counters
- S3: Unstructured storage — medical documents, lab reports, telemedicine recordings

## Frontend Architecture
- Shared design system in `frontend/shared/design-system/` used by both web and mobile
- Shared API client in `frontend/shared/api-client/` — single source of truth for backend calls
- Shared state management in `frontend/shared/state/`
- Feature-based folder structure within web and mobile (`features/`, `screens/`, `components/`)

## Authentication
- Centralized in `backend/shared/auth/`
- JWT-based tokens; refresh token rotation
- Role-based access: patient, provider, admin, facility-admin
