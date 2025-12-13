/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />

import type PocketBase from 'pocketbase';
import type { AuthModel } from 'pocketbase';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user: AuthModel | null;
      correlationId?: string;
      /** Set by $lib/server/rate-limiter middleware for response headers */
      rateLimit?: {
        allowed: boolean;
        remaining: number;
        resetTime: number;
      };
    }
    interface Error {
      message: string;
      code?: string;
    }
    interface PageData {
      user: AuthModel | null;
    }
    // interface Platform {}
  }
}

export {};
