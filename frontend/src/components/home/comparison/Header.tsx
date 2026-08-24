import React from "react";
import { TypographyH1 } from "@/src/components/shadcn-studio/typography/typography-01";

const Header = () => {
  return (
    <section className="w-full rounded-t-[24px] px-4 py-6">
      <div className="w-full text-left md:w-xl">
        {/* Main Heading */}
        <TypographyH1 className="max-w-5xl text-left text-foreground">
          The Evolution of {" "}
          <span className="text-primary"> Career Learning.</span>
        </TypographyH1>
        <p className="section-description text-base md:text-lg text-muted-foreground mt-2">
          From static course libraries to an AI companion that maps, verifies and
          adapts your entire career growth.
        </p>
      </div>
    </section>
  );
};

export default Header;
