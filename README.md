# 🍄 Scheduler Mycelium

A production-ready, multi-tenant appointment scheduling SaaS platform designed for service-based businesses (salons, barbershops, clinics, studios, and fitness centers) where clients book appointments with specific staff members.

This project is structured as a monorepo containing a **Spring Boot 4 / Java 21 REST API backend** and a **Next.js / TypeScript / Tailwind CSS v4 frontend**.

---

## 📌 Problem Domain & Solution

### The Challenge
Most small-to-medium service businesses coordinate appointments using manual processes (spreadsheets, phone calls, paper planners, or direct messages). This results in:
*   **Double bookings and scheduling conflicts** due to lack of real-time validation.
*   **Lost productivity** and missed breaks for staff members.
*   **High cancellation rates** without enforceability.
*   **No central audit trail** to track booking history, changes, or completions.

### The Solution
**Scheduler Mycelium** provides a single source of truth for real-time availability:
*   **Isolated Multi-Tenancy:** Each business operates as an independent tenant.
*   **Accurate Real-Time Slot Calculation:** A specialized scheduling engine matches business hours, breaks, days off, public closures, and existing appointments to compute absolute slot availability.
*   **Stateless Authentication & Authorization:** Multi-role JWT-based security keeps tenant data secure and ensures workers only access information within their scope.
*   **Automated Webhook Notifications:** Integrates with external systems (like n8n) to fire instant email or SMS alerts for bookings and cancellations.

---

## 🛠️ Architecture & Tech Stack

### Monorepo Structure

```
scheduler-mycelium/ (Root)
├── scheduler-mycelium/      # Java 21 / Spring Boot 4 REST API
└── scheduler-mycelium-fe/   # Next.js / React 19 Frontend App
```

### Technology Matrix

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Backend** | Java 21 / Spring Boot 4.0.6 | Spring Data JPA, Spring Security, Validation, Actuator |
| **Database** | PostgreSQL | Hibernate validation / schema alignment |
| **Authentication** | JWT (Stateless) | `jjwt` 0.12.6 |
| **API Documentation** | OpenAPI 3.0 | `springdoc-openapi-starter-webmvc-ui` 3.0.2 |
| **Frontend** | React 19 / Next.js 16.2.7 | Tailwind CSS v4, TypeScript |
| **Notifications** | n8n Webhook Outbox | Spring `RestClient` with default connection/read timeouts |
| **Infrastructure** | Docker & Docker Compose | Multi-stage distroless-like builder, Nginx proxy, Let's Encrypt |

---

## 🧬 Domain Model

```
               ┌──────────────────────────────────────────────────┐
               │         Account (Auth / Security Actor)          │
               │  (CUSTOMER | BUSINESS_OWNER | STAFF | SUPER_ADMIN) │
               └───────────────────────┬──────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
          ┌──────────┐                                 ┌──────────────┐
          │ Customer │                                 │   Business   │
          └────┬─────┘                                 │   (Tenant)   │
               │                                       └──────┬───────┘
               │                                              │
               │         ┌───────────────────┬────────────────┼──────────────────┐
               │         ▼                   ▼                ▼                  ▼
               │   ┌───────────┐      ┌──────────────┐ ┌──────────────┐   ┌─────────────┐
               │   │  Service  │      │   Settings   │ │   Closure    │   │ StaffMember │
               │   │ (Catalog) │      │ (Rules/Slot) │ │  (Holidays)  │   │  (Hours)    │
               │   └─────┬─────┘      └──────────────┘ └──────────────┘   └──────┬──────┘
               │         │                                                       │
               │         │                                                       ▼
               │         │                                                ┌─────────────┐
               │         │                                                │ StaffDayOff │
               │         │                                                └─────────────┘
               ▼         ▼                                                       │
         ┌────────────────────────────────────────────────────────────────┐      │
         │                          Appointment                           │◄─────┘
         │               (BOOKED ──► CANCELLED | COMPLETED)               │
         └────────────────────────────────────────────────────────────────┘
```

### Roles & Access Rights

| Role | Entity | Capabilities |
| :--- | :--- | :--- |
| **`CUSTOMER`** | `Customer` | List businesses, query slots, book appointments, cancel own bookings, modify profile. |
| **`BUSINESS_OWNER`** | `Business` | Complete setup, manage services/staff, configure tenant settings/closures, resolve billing/admin tasks, complete/cancel any booking. |
| **`STAFF`** | `StaffMember` | View personal daily roster, cancel or mark completed their assigned appointments. |
| **`SUPER_ADMIN`** | Platform | Globally monitor all tenants, audit logs, toggle business subscription status. |

---

## ⚙️ Slot Availability Engine

The core value of the application is the `SlotAvailabilityService` engine. It computes bookable slots on a chosen date by executing a strict validation pipeline:

```
[Start of Day] ────────► [Staff Work Hours] ────────► [Subtract Staff Breaks]
                                                             │
[Available Slots] ◄─── [Filter Existing Bookings] ◄─── [Check Staff Days Off / Closures]
```

1.  **Staff Base Availability:** Looks up the active `StaffMember`’s starting and ending hours for the requested weekday.
2.  **Break Windows:** Carves out time ranges designated for breaks.
3.  **Staff Days Off & Business Closures:** Checks if the date falls on a `StaffDayOff` or a global `BusinessClosure` (e.g. public holidays). If matched, returns zero slots.
4.  **Service Duration & Slot Interval:** Calculates slots based on `Service.duration` and the tenant's `BusinessSettings.slotInterval`.
5.  **Appointment Intersection:** Eliminates times overlapping with existing `BOOKED` appointments.
6.  **Cancellation Cutoff Enforcement:** When booking or modifying, ensures the time satisfies the tenant's `cancellationCutoffHours` rule.

---

## 🚦 Getting Started

### Prerequisites
*   **Java Development Kit (JDK) 21**
*   **Node.js v20+**
*   **PostgreSQL 15+**
*   **Maven 3.9+**

### 1. Database Setup
Create a PostgreSQL database for the scheduler:
```sql
CREATE DATABASE schedule;
```

### 2. Backend Configurations
Navigate to `scheduler-mycelium/src/main/resources/application.properties` or configure env vars:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/schedule
spring.datasource.username=postgres
spring.datasource.password=your_secure_password

jwt.secret=your_super_secret_signing_key_at_least_32_chars_long
jwt.expiration-ms=86400000

# Outbox Notifications Webhooks
webhook.booking-confirmed=https://n8n.yourdomain.com/webhook/booking-confirmed
webhook.booking-cancelled=https://n8n.yourdomain.com/webhook/booking-cancelled
```

Run the spring application in development mode (which automatically performs a database schema `update`):
```bash
cd scheduler-mycelium
mvn spring-boot:run
```
*   **API Live at:** `http://localhost:8080`
*   **Swagger API Docs:** `http://localhost:8080/swagger-ui/index.html`

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd scheduler-mycelium-fe
npm install
```

Configure local environment variables in `scheduler-mycelium-fe/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the development server:
```bash
npm run dev
```
*   **Frontend Live at:** `http://localhost:3000`

---

## 🌐 API Reference Overview

Base Route: `/api`

### Auth & Account Endpoints
*   `POST /auth/register` - Create user account (returns user details).
*   `POST /auth/login` - Authenticate credentials (returns JWT token in body + profile payload).

### Tenant & Settings Endpoints
*   `POST /businesses` - Create business tenant profile (`BUSINESS_OWNER` only).
*   `GET /businesses/{id}` - Public business information lookup.
*   `PUT /businesses/{id}/settings` - Update booking settings (cutoff rules, interval).
*   `POST /businesses/{id}/closures` - Add holidays or operational closure dates.

### Roster & Catalog Endpoints
*   `GET/POST /businesses/{id}/services` - Manage catalog services.
*   `GET/POST /businesses/{id}/staff` - Register staff, define work hours.
*   `POST /businesses/{id}/staff/{staffId}/daysoff` - Schedule staff-specific days off.

### Appointment Engine Endpoints
*   `GET /slots` - Public availability lookup. Query parameters: `businessId`, `staffId`, `serviceId`, `date`.
*   `POST /appointments` - Book a slot (returns `AppointmentResponseDTO`).
*   `POST /appointments/{id}/cancel` - Cancel appointment (returns updated `AppointmentResponseDTO`).
*   `POST /appointments/{id}/complete` - Mark appointment as fulfilled.

---

## 🚢 Production Deployment

The production environment runs containerized applications on a **Hetzner Cloud VPS (Ubuntu 24.04)** behind **Nginx** acting as a reverse proxy with auto-renewed **Let's Encrypt SSL** certificates. Continuous Integration and Continuous Deployment are automated using **GitHub Actions**.

### Infrastructure Layout

```
                        [ Internet ]
                             │
                             ▼ (HTTPS on Port 443)
                      ┌──────────────┐
                      │    Nginx     │
                      └──────┬───────┘
                             │
            ┌────────────────┴────────────────┐
            ▼ (Proxy Pass to Port 8080)       ▼ (Vercel Integration)
  ┌───────────────────┐             ┌───────────────────┐
  │   Spring Boot     │             │      Next.js      │
  │ (Docker Container)│             │ (Vercel Frontend) │
  └─────────┬─────────┘             └───────────────────┘
            │
            ▼ (Internal Docker Network)
  ┌───────────────────┐
  │    PostgreSQL     │
  │ (Docker Container)│
  └───────────────────┘
```

### Production Setup Instructions

#### 1. Server Configuration (Hetzner VPS)
Install Docker Engine and configure your firewall / dependencies:
```bash
# Update repositories and install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install reverse proxy and SSL tools
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Create installation directory
sudo mkdir -p /opt/scheduler-mycelium
sudo chown $USER:$USER /opt/scheduler-mycelium
```

#### 2. Environment Setup
Copy the production environment template file onto the server at `/opt/scheduler-mycelium/.env` and edit configurations:
```bash
cd /opt/scheduler-mycelium
nano .env
```
Ensure you set secure production passwords and keys:
*   `SPRING_DATASOURCE_PASSWORD` / `POSTGRES_PASSWORD` - Cryptographically strong database passwords.
*   `JWT_SECRET` - Generate using `openssl rand -hex 64`.
*   `CORS_ALLOWED_ORIGINS` - Production Frontend URL (e.g. `https://scheduler.yourdomain.com`).
*   `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` - Assures database schema is read-only and verified at runtime.

#### 3. Database Schema Initialization (First Time Run)
On the initial run, the tables must be created:
1. Temporarily modify `/opt/scheduler-mycelium/.env` to include: `SPRING_JPA_HIBERNATE_DDL_AUTO=create`
2. Run `docker compose up -d` to launch PostgreSQL and Spring Boot.
3. Check application logs to confirm schema creation succeeded.
4. Modify `.env` to return `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` and execute `docker compose up -d app` to restart the backend container securely.

#### 4. Configure Nginx Reverse Proxy
Create configuration file `/etc/nginx/sites-available/scheduler-mycelium`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```
Enable the configuration and configure SSL certificates using Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/scheduler-mycelium /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🤖 CI/CD Pipelines

Automated workflows are located in the `.github/workflows` directory:

1.  **Continuous Integration (`ci.yml`):**
    *   Fires on all pull requests and pushes to development branches.
    *   Launches a PostgreSQL service container in GitHub Actions.
    *   Builds the Spring Boot project and runs unit and integration tests.
2.  **Continuous Deployment (`deploy.yml`):**
    *   Fires automatically on a push to the `main` branch.
    *   Compiles, packages, and builds a production-grade multi-stage Docker image.
    *   Pushes the built container to **GitHub Container Registry (GHCR)**.
    *   Logs into the Hetzner target host via SSH, pulls down the new image, updates the application container with no database downtime, and runs health checks.

### Required GitHub Repository Secrets
Under your GitHub Repository settings, define the following variables:
*   `HETZNER_HOST` - Public IP Address of the VPS.
*   `HETZNER_USER` - The deployment user account (e.g., `ubuntu`).
*   `HETZNER_SSH_KEY` - The SSH private key corresponding to the public key on the host.

---

## 🛠️ Management & Monitoring Commands

Use these commands on the production host to inspect the application runtime:

```bash
cd /opt/scheduler-mycelium

# Check Docker services health
docker compose ps

# Stream backend container logs
docker compose logs -f app

# Inspect health details via Spring Actuator
curl http://localhost:8080/actuator/health

# Perform a manual PostgreSQL backup
docker compose exec db pg_dump -U scheduler schedule > backup_$(date +%Y%m%d).sql

# Restore a database backup
cat backup.sql | docker compose exec -T db psql -U scheduler -d schedule
```

---

## 📄 License

This project is licensed under the MIT License. Details can be found in the [LICENSE](LICENSE) file.
