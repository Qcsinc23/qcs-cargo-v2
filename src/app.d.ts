import type PocketBase from 'pocketbase';
import type { AuthModel } from 'pocketbase';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user: AuthModel | null;
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