# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy the source code
COPY . .

# Make gradlew executable
RUN chmod +x gradlew

# Build the application
RUN ./gradlew build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

# Render exposes the port via the PORT environment variable
ENV PORT=8080
EXPOSE $PORT

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]