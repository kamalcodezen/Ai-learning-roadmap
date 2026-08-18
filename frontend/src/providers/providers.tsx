"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "../components/ui/toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </NextThemesProvider>
  );
}
