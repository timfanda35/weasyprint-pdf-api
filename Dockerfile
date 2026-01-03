FROM python:3.14-alpine AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Build Stage
FROM base AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev \
    python3-dev

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application Stage
FROM base

EXPOSE 8000
ENV PORT=8000
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    pango \
    libffi \
    libjpeg \
    zlib \
    ttf-dejavu ttf-droid ttf-freefont ttf-liberation font-noto font-noto-cjk

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY ./app /app

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

CMD ["sh", "-c", "uvicorn main:app --host=0.0.0.0 --port=${PORT}"]

