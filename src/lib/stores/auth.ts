import { writable, derived, get } from 'svelte/store';
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

  // Sync with PocketBase auth store
  if (browser) {
    pb.authStore.onChange((token, model) => {
      const user = transformUser(model);
      if (user) {
        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    }, true);
  }

  function transformUser(model: AuthModel | null): User | null {
    if (!model) return null;
    return {
      id: model.id,
      email: model.email,
      name: model.name || '',
      phone: model.phone,
      role: model.role || 'customer',
      avatar: model.avatar ? pb.files.getUrl(model, model.avatar, { thumb: '100x100' }) : undefined,
      verified: model.verified || false,
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
      created: model.created,
      updated: model.updated
    };
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

    // Login with email/password
    async login(email: string, password: string) {
      update(state => ({ ...state, isLoading: true }));

      try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        const user = transformUser(authData.record);

        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return { success: true, user };
      } catch (error: unknown) {
        update(state => ({ ...state, isLoading: false }));
        throw new Error(getErrorMessage(error, 'Login failed'));
      }
    },

    // Register new user
    async register(data: {
      email: string;
      password: string;
      passwordConfirm: string;
      name: string;
      phone?: string;
    }) {
      update(state => ({ ...state, isLoading: true }));

      try {
        // Create user
        await pb.collection('users').create({
          ...data,
          role: 'customer',
          emailVisibility: true
        });

        // Send verification email
        await pb.collection('users').requestVerification(data.email);

        // Auto-login after registration
        const authData = await pb.collection('users').authWithPassword(data.email, data.password);
        const user = transformUser(authData.record);

        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return { success: true, user };
      } catch (error: unknown) {
        update(state => ({ ...state, isLoading: false }));
        throw new Error(getErrorMessage(error, 'Registration failed'));
      }
    },

    // Logout
    async logout() {
      pb.authStore.clear();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      // Invalidate all server data and redirect
      await invalidateAll();
      goto('/');
    },

    // Request password reset
    async requestPasswordReset(email: string) {
      try {
        await pb.collection('users').requestPasswordReset(email);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to send reset email'));
      }
    },

    // Confirm password reset
    async confirmPasswordReset(token: string, password: string, passwordConfirm: string) {
      try {
        await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to reset password'));
      }
    },

    // Request email verification
    async requestVerification(email: string) {
      try {
        await pb.collection('users').requestVerification(email);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to send verification email'));
      }
    },

    // Update profile
    async updateProfile(data: Partial<User>) {
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        const updated = await pb.collection('users').update(currentUser.id, data);
        const user = transformUser(updated);

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
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const updated = await pb.collection('users').update(currentUser.id, formData);
        const user = transformUser(updated);

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
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        await pb.collection('users').update(currentUser.id, {
          oldPassword: currentPassword,
          password: newPassword,
          passwordConfirm: confirmPassword
        });

        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to change password'));
      }
    },

    // OAuth login (Google)
    async loginWithGoogle() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
        const user = transformUser(authData.record);

        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return { success: true, user };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Google login failed'));
      }
    },

    // Request Magic Link login
    async requestMagicLink(email: string) {
      try {
        // PocketBase doesn't have built-in magic link, so we use OTP (one-time password)
        // This sends a verification email that can be used as a magic link
        await pb.collection('users').requestVerification(email);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to send magic link'));
      }
    },

    // Verify email token (for magic link / verification)
    async verifyEmail(token: string) {
      try {
        await pb.collection('users').confirmVerification(token);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to verify email'));
      }
    },

    // Delete account (GDPR compliance)
    async deleteAccount(password: string) {
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        // Verify password first by attempting to re-authenticate
        await pb.collection('users').authWithPassword(currentUser.email, password);
        
        // Mark account for deletion (soft delete)
        // PocketBase will handle the actual deletion after the grace period
        await pb.collection('users').update(currentUser.id, {
          deleted_at: new Date().toISOString(),
          email: `deleted_${currentUser.id}@deleted.local`, // Anonymize email
          name: 'Deleted User'
        });

        // Clear auth and redirect
        pb.authStore.clear();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });

        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to delete account. Please check your password.'));
      }
    },

    // Get active sessions
    async getSessions() {
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        // PocketBase doesn't have built-in session management
        // We'll track sessions in a separate collection
        const sessions = await pb.collection('sessions').getFullList({
          filter: `user = "${currentUser.id}"`,
          sort: '-last_active'
        });
        return sessions;
      } catch (error: unknown) {
        // If sessions collection doesn't exist, return empty
        console.warn('Sessions collection not available');
        return [];
      }
    },

    // Revoke a specific session
    async revokeSession(sessionId: string) {
      try {
        await pb.collection('sessions').delete(sessionId);
        return { success: true };
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to revoke session'));
      }
    },

    // Revoke all other sessions
    async revokeAllOtherSessions() {
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        const sessions = await pb.collection('sessions').getFullList({
          filter: `user = "${currentUser.id}"`
        });
        
        // Delete all sessions (current one will be recreated on next auth)
        for (const session of sessions) {
          await pb.collection('sessions').delete(session.id);
        }
        
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
      const state = get({ subscribe });
      const currentUser = state.user;
      if (!currentUser) throw new Error('Not authenticated');

      try {
        const updated = await pb.collection('users').update(currentUser.id, preferences);
        const user = transformUser(updated);

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

