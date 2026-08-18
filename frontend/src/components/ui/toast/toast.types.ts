export type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "default";

export interface ToastProps {
  variant?: ToastVariant;
  message: string;
  duration?: number;
}

export interface ToastItem extends ToastProps {
  id: string;
}