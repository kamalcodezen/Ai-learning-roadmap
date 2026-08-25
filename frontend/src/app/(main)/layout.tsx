import Navbar from "@/src/components/layout/navbar/Navbar";
import Footer from "@/src/components/layout/footer/Footer";
import type { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-[#f4edff] transition-colors duration-300 dark:bg-[#2b1e42ec]">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
