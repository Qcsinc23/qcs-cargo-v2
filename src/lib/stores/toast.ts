import { toast as sonnerToast } from 'svelte-sonner';

export const toast = {
  success(message: string, options?: { description?: string; duration?: number }) {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000
    });
  },

  error(message: string, options?: { description?: string; duration?: number }) {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000
    });
  },

  warning(message: string, options?: { description?: string; duration?: number }) {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000
    });
  },

  info(message: string, options?: { description?: string; duration?: number }) {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000
    });
  },

  loading(message: string) {
    return sonnerToast.loading(message);
  },

  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  },

  promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) {
    return sonnerToast.promise(promise, options);
  }
};

