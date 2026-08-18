import Navbar from "@/src/components/layout/navbar/Navbar";
import type { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen transition-colors duration-300">
        {children}
      </main>
    </>
  );
};

export default MainLayout;
