FROM alpine:latest

ARG PB_VERSION=0.22.27

WORKDIR /app

# Install dependencies
RUN apk add --no-cache ca-certificates tzdata wget unzip

# Download and install PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip && \
    unzip pocketbase_${PB_VERSION}_linux_amd64.zip && \
    rm pocketbase_${PB_VERSION}_linux_amd64.zip && \
    chmod +x pocketbase

# Create non-root user
RUN addgroup -g 1001 pocketbase && \
    adduser -D -u 1001 -G pocketbase pocketbase

# Create data directory
RUN mkdir -p /pb_data && chown -R pocketbase:pocketbase /pb_data /app

USER pocketbase

EXPOSE 8090

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:8090/api/health || exit 1

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]


