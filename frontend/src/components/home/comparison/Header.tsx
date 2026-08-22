import React from "react";
import { TypographyH1 } from "@/src/components/shadcn-studio/typography/typography-01";

const Header = () => {
  return (
    <section className="w-full rounded-t-[24px]  px-4 py-6">
      <div className="w-full">
        

        {/* Main Heading */}
        <TypographyH1 className="max-w-5xl text-left text-foreground">
          The Evolution of {" "}
          <span className="text-primary"> Career Learning.</span>
        </TypographyH1>
      </div>
    </section>
  );
};

export default Header;