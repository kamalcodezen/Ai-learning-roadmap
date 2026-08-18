import type { ToastItem, ToastProps } from "./toast.types";

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);

  listener([...toasts]);

  return () => {
    listeners.delete(listener);
  };
}

export function showToast(toast: ToastProps) {
  const newToast: ToastItem = {
    ...toast,
    id: crypto.randomUUID(),
  };

  toasts = [...toasts, newToast];

  notify();
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);

  notify();
}