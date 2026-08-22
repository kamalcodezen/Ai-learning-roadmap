import React from "react";

const Header = () => {
  return (
    <section className="w-full rounded-t-[24px]  px-4 py-6">
      <div className="w-full">
        

        {/* Main Heading */}
        <h1 className="max-w-5xl text-left text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          The Evolution of {" "}
          <span className="text-primary"> Career Learning.</span>
        </h1>
      </div>
    </section>
  );
};

export default Header;