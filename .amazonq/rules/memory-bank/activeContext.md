# Active Context

## Current State
Project is in the **initial scaffolding phase**. The directory structure has been established but no source files exist yet. All service directories (`src/`, `tests/`, etc.) are empty.

## What Was Just Done
- Full project directory structure scaffolded across backend and frontend
- Memory Bank initialized to capture project context

## Immediate Next Steps
The project needs to be bootstrapped. Logical starting order:

1. **Define shared contracts** (`backend/shared/contracts/`) — DTOs for User, Patient, Appointment, Facility, EHR Record, Notification
2. **Set up shared auth** (`backend/shared/auth/`) — JWT middleware, role definitions
3. **Bootstrap API gateway** (`backend/gateway/api-gateway/`) — routing config, auth middleware integration
4. **Implement triage-service** — core clinical logic, rules engine
5. **Implement facility-matching-service** — geolocation-based matching
6. **Implement appointment-service** — scheduling with calendar logic
7. **Implement cost-estimation-service** — pricing engine
8. **Implement EHR service** — record CRUD with access controls
9. **Implement telemedicine-service** — WebRTC or similar session management
10. **Implement notification-service** — event-driven SMS/push/email dispatch
11. **Implement M-Pesa integration** — Daraja API wrapper
12. **Build frontend** — web, mobile, USSD in parallel once APIs are stable

## Active Decisions Needed
- Programming language per service (Node.js vs Python)
- Frontend framework confirmation (Next.js vs plain React for web)
- State management library for frontend
- Telemedicine technology (WebRTC, Twilio, Agora, etc.)
- USSD gateway provider (Africa's Talking, etc.)
- Deployment target (ECS vs EKS vs Lambda)

## Known Risks
- USSD session timeout (180s limit) constrains flow complexity
- M-Pesa Daraja API sandbox vs production environment differences
- Healthcare data compliance requirements may affect data residency choices
- Inter-service latency must be managed for real-time triage + matching flows
