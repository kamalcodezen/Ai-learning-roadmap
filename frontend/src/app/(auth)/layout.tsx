import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <main className="min-h-screen transition-colors duration-300">
        {children}
      </main>
    </>
  );
};

export default AuthLayout;
