# QCS Cargo 2.0 - API Documentation

## Overview

This document describes the API endpoints for QCS Cargo 2.0.

## Authentication

All API requests (except public endpoints) require authentication via PocketBase.

## Endpoints

### Health Check

```
GET /api/health
```

Returns the health status of the application.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

*More endpoints will be documented as they are implemented per the PRD.*