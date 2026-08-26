import React from "react";

const Header = () => {
  return (
    <section className="w-full rounded-t-[24px] px-4 py-6">
      <div className="mx-auto flex w-full flex-col items-center text-center">
        {/* Main Heading */}
        <h2 className="section-title">
          The Evolution of{" "}
          <span className="text-primary"> Career Learning.</span>
        </h2>
        <p className="section-subtitle mt-4">
          From static course libraries to an AI companion that maps, verifies and
          adapts your entire career growth.
        </p>
      </div>
    </section>
  );
};

export default Header;
