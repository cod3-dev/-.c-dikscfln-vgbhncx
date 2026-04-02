# Product Context

## Problem Statement
Healthcare access in Africa is constrained by:
- Geographic distance from facilities
- High out-of-pocket costs with no price transparency
- Limited digital infrastructure (low smartphone penetration in rural areas)
- Fragmented health records across providers
- Long wait times and inefficient appointment systems

## Solution
A unified platform that meets users where they are — whether on a smartphone, web browser, or a basic feature phone via USSD — and connects them to the right care at the right cost.

## User Experience Goals

### Patient Journey
1. Symptom input → AI triage → recommended care level
2. Facility matching based on location, availability, cost, and specialty
3. Cost estimation before committing to an appointment
4. Appointment booking with confirmation notifications
5. Telemedicine option for non-emergency consultations
6. Post-visit: EHR updated, prescriptions sent to pharmacy

### Provider Journey
1. Receive appointment requests and manage schedule
2. Access patient EHR during consultation
3. Conduct telemedicine sessions
4. Issue referrals, lab orders, prescriptions digitally

## Channel Strategy
- Web: Full-featured dashboard for providers and tech-savvy patients
- Mobile (React Native): Primary patient-facing app, works on Android/iOS
- USSD: Fallback for feature phones — appointment booking, triage, notifications

## Payment Philosophy
- M-Pesa as primary payment rail (dominant in East Africa)
- Cost estimation shown before any commitment
- Support for insurance claim workflows (future)

## Accessibility & Inclusion
- USSD flows designed for low-literacy users
- SMS notifications as fallback
- Swahili and other local language support (future)
