import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { pb } from '$lib/pocketbase';
import type { AuthModel } from 'pocketbase';

// Helper function to safely extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  if (error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data) {
    return String(error.data.message);
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  avatar?: string;
  verified: boolean;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notification_email?: boolean;
  notification_sms?: boolean;
  notify_received?: boolean;
  notify_transit?: boolean;
  notify_delivered?: boolean;
  stripe_customer_id?: string;
  created: string;
  updated: string;
}

// Auth state
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  // NOTE:
  // We use httpOnly cookies for auth (set/cleared server-side in `hooks.server.ts`).
  // Client JS cannot read the auth cookie, so we initialize this store from server-rendered
  // `data.user` via `auth.initialize(...)` in `src/routes/+layout.svelte`.

  function transformUser(model: any | null): User | null {
    if (!model) return null;
    
    // For PocketBase users, generate avatar URL if avatar field exists
    let avatar: string | undefined;
    if (model.avatar) {
      avatar = pb.files.getUrl(model, model.avatar, { thumb: '100x100' });
    }
    
    return {
      id: model.id,
      email: model.email,
      name: model.name || '',
      phone: model.phone,
      role: model.role || 'customer',
      avatar,
      verified: model.verified ?? model.email_verified ?? false,
      address_line1: model.address_line1,
      address_line2: model.address_line2,
      city: model.city,
      state: model.state,
      zip: model.zip,
      country: model.country,
      notification_email: model.notification_email,
      notification_sms: model.notification_sms,
      notify_received: model.notify_received,
      notify_transit: model.notify_transit,
      notify_delivered: model.notify_delivered,
      stripe_customer_id: model.stripe_customer_id,
      created: model.created || new Date().toISOString(),
      updated: model.updated || new Date().toISOString()
    };
  }

  async function readErrorMessage(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = (await response.json().catch(() => null)) as any;
      return String(data?.error || data?.message || response.statusText || 'Request failed');
    }
    const text = await response.text().catch(() => '');
    return text || response.statusText || 'Request failed';
  }

  async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return (await response.json()) as T;
  }

  return {
    subscribe,
    
    // Initialize auth state from server
    initialize(userModel: AuthModel | null) {
      const user = transformUser(userModel);
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    },

    // Logout (PocketBase magic link)
    async logout() {
      update(state => ({ ...state, isLoading: true }));

      try {
        // Call logout API endpoint
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with client-side logout even if API call fails
      }

      // Clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      // Redirect to home or login page
      if (browser) {
        await goto('/login');
      }
    },

    // Update profile
    async updateProfile(data: Partial<User>) {
      try {
        const payload = {
          name: data.name,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          notification_email: data.notification_email,
          notification_sms: data.notification_sms,
          notify_received: data.notify_received,
          notify_transit: data.notify_transit,
          notify_delivered: data.notify_delivered
        };

        const response = await requestJson<{ success: true; user: AuthModel }>('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });

        const user = transformUser(response.user);

        update(currentState => ({
          ...currentState,
          user
        }));

        return { success: true, user };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to update profile'));
      }
    },

    // Update avatar
    async updateAvatar(file: File) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as { success: true; user: AuthModel };
        const user = transformUser(data.user);

        update(currentState => ({
          ...currentState,
          user
        }));

        return { success: true, user };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to update avatar'));
      }
    },

    // Change password
    async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
      try {
        await requestJson<{ success: true }>('/api/auth/password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });

        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to change password'));
      }
    },

    // Delete account (GDPR compliance)
    async deleteAccount(password: string) {
      try {
        await requestJson<{ success: true }>('/api/auth/delete-account', {
          method: 'POST',
          body: JSON.stringify({ password })
        });

        // Clear local state; server cookie is cleared by the endpoint.
        set({ user: null, isAuthenticated: false, isLoading: false });
        await invalidateAll();

        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to delete account. Please check your password.'));
      }
    },

    // Get active sessions
    async getSessions() {
      try {
        const response = await requestJson<{ success: true; sessions: any[] }>('/api/auth/sessions', {
          method: 'GET'
        });
        return response.sessions;
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to load sessions'));
      }
    },

    // Revoke a specific session
    async revokeSession(sessionId: string) {
      try {
        await requestJson<{ success: true }>(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' });
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to revoke session'));
      }
    },

    // Revoke all other sessions
    async revokeAllOtherSessions() {
      try {
        await requestJson<{ success: true }>('/api/auth/sessions/revoke-all', { method: 'POST' });
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to revoke sessions'));
      }
    },

    // Update notification preferences
    async updateNotificationPreferences(preferences: {
      notification_email?: boolean;
      notification_sms?: boolean;
      notify_received?: boolean;
      notify_transit?: boolean;
      notify_delivered?: boolean;
    }) {
      try {
        const response = await requestJson<{ success: true; user: AuthModel }>('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify(preferences)
        });

        const user = transformUser(response.user);

        update(currentState => ({
          ...currentState,
          user
        }));

        return { success: true, user };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to update notification preferences'));
      }
    }
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, $auth => $auth.user);
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const isLoading = derived(auth, $auth => $auth.isLoading);
export const userRole = derived(auth, $auth => $auth.user?.role || null);

// Role check helpers
export const isAdmin = derived(auth, $auth => $auth.user?.role === 'admin');
export const isStaff = derived(auth, $auth => $auth.user?.role === 'staff' || $auth.user?.role === 'admin');
export const isCustomer = derived(auth, $auth => $auth.user?.role === 'customer');
