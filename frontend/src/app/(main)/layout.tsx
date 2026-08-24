import Navbar from "@/src/components/layout/navbar/Navbar";
import Footer from "@/src/components/layout/footer/Footer";
import type { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-linear-to-b from-[#f4edff] to-white transition-colors duration-300 dark:from-black dark:to-black">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
