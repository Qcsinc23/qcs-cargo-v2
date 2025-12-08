# QCS Cargo 2.0 - Component Library

## Overview

This document describes the component library for QCS Cargo 2.0.

## Directory Structure

```
src/lib/components/
├── ui/               # shadcn-svelte base components
├── layout/           # Layout components (Header, Footer, Nav)
├── forms/            # Form components (Input, Select, etc.)
├── dashboard/        # Dashboard widgets
├── tracking/         # Tracking components
├── warehouse/        # Warehouse management components
├── admin/            # Admin-specific components
└── shared/           # Shared/common components
```

## Base Components (shadcn-svelte)

We use shadcn-svelte for base UI components. These are installed in `src/lib/components/ui/`.

## Layout Components

### SkipLink

Accessibility component for keyboard navigation.

```svelte
<SkipLink targetId="main-content" label="Skip to main content" />
```

### OfflineIndicator

Shows network status to users.

```svelte
<OfflineIndicator />
```

---

*More components will be documented as they are implemented per the PRD.*