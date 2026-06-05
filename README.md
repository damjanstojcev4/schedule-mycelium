# Scheduler Mycelium

A multi-tenant appointment scheduling backend for service businesses — salons, barbershops, clinics, studios, and similar operations where customers book time with specific staff members.

The API handles the full lifecycle: business setup, service catalog, staff availability, slot calculation, booking, cancellation, and completion. Each business operates as an isolated tenant; owners manage their own data, customers book online, and staff work within their assigned business.

---

## Why this exists

Most small service businesses still coordinate appointments manually — phone calls, DMs, paper calendars. That leads to double bookings, missed breaks, and no clear record of who cancelled what.

Scheduler Mycelium provides a **single source of truth** for availability and appointments:

- Customers see **real open slots** before they book, not guesswork.
- Owners configure **services, staff hours, closures, and booking rules** in one place.
- The system **prevents conflicts** by checking working hours, breaks, days off, business closures, and existing appointments before confirming a booking.

This repository is the **REST API backend**. A frontend can consume these endpoints to build customer booking flows and owner dashboards.

---

## How it works

### Roles

| Role | Who | What they can do |
|------|-----|------------------|
| `CUSTOMER` | End user | Browse businesses, check slots, book/cancel own appointments, manage profile |
| `BUSINESS_OWNER` | Business admin | Create a business, manage services/staff/settings/closures, complete appointments |
| `STAFF` | Employee | View assigned appointments, cancel/complete within their business |

### Typical booking flow

1. **Owner** registers, creates a business, adds services and staff (with work hours and optional breaks).
2. **Customer** registers, browses a business, picks a service and staff member.
3. **Customer** calls `GET /api/slots` for a date — the engine returns bookable start times.
4. **Customer** books one of those slots via `POST /api/appointments`.
5. Either party can **cancel** (customers face a configurable cutoff window). Staff or owners can **mark complete**.

### Slot availability engine

`SlotAvailabilityService` computes open times by combining:

- Staff **working hours** (`workStart` → `workEnd`)
- Optional **break windows**
- **Staff days off**
- **Business-wide closure days** (holidays, etc.)
- **Existing appointments** (overlap detection)
- **Service duration** and configurable **slot interval** (from business settings)

If a business is closed or a staff member is off that day, the slot list is empty — no error, just no availability.

### Multi-tenancy

Every business is a tenant. `TenantGuard` ensures owners can only mutate resources belonging to their business, and staff actions are scoped to the correct business. JWT tokens carry the account identity and role; protected endpoints reject cross-tenant access.

---

## Tech stack

- **Java 21**
- **Spring Boot 4** (Web, Data JPA, Security, Validation)
- **PostgreSQL**
- **JWT** authentication (jjwt)
- **SpringDoc OpenAPI** — interactive API docs at `/swagger-ui.html`
- **Lombok**

---

## Getting started

### Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL (local or remote)

### Database

Create a database (default name in config: `schedule`):

```sql
CREATE DATABASE schedule;
```

### Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/schedule
spring.datasource.username=postgres
spring.datasource.password=<your-password>

jwt.secret=<at-least-32-characters-for-hs256>
jwt.expiration-ms=86400000
```

Hibernate `ddl-auto=update` is enabled for development — tables are created/updated automatically on startup.

### Run

```bash
mvn spring-boot:run
```

The server starts on **http://localhost:8080** by default.

### API documentation

Open **http://localhost:8080/swagger-ui.html** to explore and test endpoints. Use **Authorize** with `Bearer <token>` after registering or logging in.

---

## API overview

Base path: `/api`

| Area | Path | Auth | Description |
|------|------|------|-------------|
| Auth | `POST /auth/register`, `POST /auth/login` | Public | Create account, get JWT |
| Businesses | `GET/POST /businesses`, `GET /businesses/{id}` | Mixed | List/create/view businesses |
| Settings | `PUT /businesses/{id}/settings` | Owner JWT | Cancellation cutoff, slot interval |
| Closures | `GET/POST /businesses/{id}/closures` | Mixed | Business-wide days off |
| Services | `/businesses/{businessId}/services` | Mixed | CRUD for offered services |
| Staff | `/businesses/{businessId}/staff` | Mixed | Staff roster, hours, days off |
| Slots | `GET /slots?businessId&staffId&serviceId&date` | Public | Available time slots |
| Appointments | `/appointments` | JWT | Book, list, cancel, complete |
| Customer | `GET/PUT /customers/me` | Customer JWT | Profile management |

Public endpoints (no token): auth, business listing/detail, services/staff listing, slot lookup.

Owner-only mutations require a `BUSINESS_OWNER` JWT and pass through `TenantGuard`.

---

## Domain model

```
Account (CUSTOMER | BUSINESS_OWNER | STAFF)
   │
   ├── Customer ──────────────┐
   │                          │
   └── Business (owner)       │
         ├── BusinessSettings (cutoff hours, slot interval)
         ├── BusinessClosure  (closure dates)
         ├── Service          (name, duration, price)
         ├── StaffMember      (hours, breaks, linked STAFF account)
         │     └── StaffDayOff
         └── Appointment ─────┘
               (BOOKED → CANCELLED | COMPLETED)
```

Appointment statuses: `BOOKED`, `CANCELLED`, `COMPLETED`. Cancellations record who cancelled (`CUSTOMER`, `STAFF`, or `BUSINESS_OWNER`).

---

## Project structure

```
src/main/java/com/damjan/scheduler_mycelium/
├── config/          Security, OpenAPI, Swagger UI
├── domain/
│   ├── account/     Registration, login, JWT issuance
│   ├── business/    Businesses, settings, closures
│   ├── customer/    Customer profiles
│   ├── service/     Service catalog per business
│   ├── staff/       Staff members and days off
│   └── appointment/ Booking and lifecycle
├── scheduling/      Slot availability engine
├── security/        JWT filter, TenantGuard, user details
└── exception/       Global error handling (404, 400, 401, 403, 409, …)
```

---

## Error responses

All handled errors return JSON:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Appointment not found"
}
```

Validation errors include a `fieldErrors` map. See `GlobalExceptionHandler` for the full mapping.

---

## Development

```bash
# Compile
mvn compile

# Run tests
mvn test

# Package
mvn package
```

---

## License

MIT License — see [LICENSE](scheduler-mycelium/LICENSE).
