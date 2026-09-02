import React from "react";

const Header = () => {
  return (
    <section className="w-full rounded-t-[24px] px-4 py-6">
      <div className="mx-auto flex w-full flex-col items-center text-center">
        {/* Main Heading */}
        <h2 className="font-poppins text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-4xl">
          The Evolution of{" "}
          <span className="text-primary"> Career Learning.</span>
        </h2>
        <p className="section-description mx-auto mt-4 max-w-[95%] px-4 font-poppins text-lg text-muted-foreground md:max-w-xl">
          From static course libraries to an AI companion that maps, verifies and
          adapts your entire career growth.
        </p>
      </div>
    </section>
  );
};

export default Header;
