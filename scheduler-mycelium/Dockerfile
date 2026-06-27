# ─────────────────────────────────────────────────────────────────────────────
#  Multi-stage Dockerfile — Scheduler Mycelium Spring Boot Backend
#
#  Stage 1 (builder): Resolves Maven dependencies and builds the fat JAR.
#  Stage 2 (runtime): Minimal JRE-only image; runs as a non-root user.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and pom first — Docker caches this layer if pom hasn't changed.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B -q

# Copy source and build the application.
COPY src/ src/
RUN ./mvnw package -B -q -DskipTests

# ── Stage 2: Runtime ───────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for the HEALTHCHECK below (minimal Alpine image has none).
RUN apk add --no-cache curl

# Create a non-root system user and group.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the fat JAR from the builder stage — no source, no Maven, no JDK.
COPY --from=builder /build/target/*.jar app.jar

# Fix ownership so the non-root user can read the JAR.
RUN chown appuser:appgroup app.jar

# Switch to the non-root user.
USER appuser

# Expose the application port (overridable via SERVER_PORT env var).
EXPOSE 8080

# JVM tuning for a containerised environment:
#   -XX:+UseContainerSupport  — respects Docker CPU/memory limits
#   -XX:MaxRAMPercentage=75   — use up to 75% of container RAM for the heap
#   -Djava.security.egd=...   — faster startup by using /dev/urandom for entropy
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# ── Health check ───────────────────────────────────────────────────────────
# Docker will mark the container unhealthy if /actuator/health returns non-200.
# interval: how often to check   start_period: grace period after startup
HEALTHCHECK \
  --interval=30s \
  --timeout=10s \
  --start-period=60s \
  --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
