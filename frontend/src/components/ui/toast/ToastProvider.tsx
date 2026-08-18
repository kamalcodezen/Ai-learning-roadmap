"use client";

import { useEffect, useState } from "react";
import Toast from "./Toast";
import {
  removeToast,
  subscribeToToasts,
} from "./toast.store";
import type { ToastItem } from "./toast.types";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToToasts(setToasts);
  }, []);

  return (
    <>
      {children}

      <div
        className="
          pointer-events-none
          fixed
          bottom-4
          right-4
          z-[9999]
          flex
          flex-col
          items-end
          gap-3
        "
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}