import React from "react";

const Header = () => {
  return (
    <div className="w-full text-left md:w-xl">
      {/* Main Heading */}
      <h2 className="font-poppins text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
        The Evolution of{" "}
        <i className="font-serif italic font-normal text-muted-foreground">
          Career
        </i>{" "}
        <span className="font-medium underline decoration-primary/50 underline-offset-8 text-primary">
          Learning.
        </span>
      </h2>
      <p className="section-description text-base md:text-lg text-muted-foreground mt-1">
        From static course libraries to an AI companion that maps, verifies and
        adapts your entire career growth.
      </p>
    </div>
  );
};

export default Header;
