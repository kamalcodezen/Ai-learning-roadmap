import type { ReactNode } from "react";

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
