# Tech Context

## Frontend Stack
| Layer | Technology |
|---|---|
| Web | React (likely Next.js based on `app/` directory) |
| Mobile | React Native |
| USSD | Custom flow engine (Node.js or Python) |
| Shared State | To be determined (Redux / Zustand / Context) |
| Design System | Custom component library in `frontend/shared/design-system/` |
| API Client | Shared client in `frontend/shared/api-client/` |

## Backend Stack
| Layer | Technology |
|---|---|
| API Gateway | Node.js / Express or similar |
| Microservices | Node.js or Python (per service, TBD) |
| Auth | JWT + OAuth2 |
| Triage Engine | Rules-based engine in `triage-service/rules/` |

## Data Layer
| Store | Use Case |
|---|---|
| PostgreSQL | Users, appointments, EHR, facilities, pricing |
| Redis | Sessions, caching, pub/sub, rate limiting |
| AWS S3 | Documents, lab reports, media files |

## External Integrations
| Integration | Purpose |
|---|---|
| M-Pesa | Primary payment processing |
| Hospital Systems | Patient data sync, bed availability |
| Lab Systems | Lab order submission, result ingestion |
| Pharmacy Systems | Prescription routing and fulfillment |

## Infrastructure (Inferred)
- Cloud: AWS (S3 usage confirms this)
- API Gateway likely deployed behind a load balancer
- Services containerized (Docker/ECS or Kubernetes)
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
