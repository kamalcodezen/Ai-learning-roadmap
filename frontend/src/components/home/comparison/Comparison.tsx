import React from "react";
import Header from "./Header";
import LeftSideCard from "./LeftSideCard";
import MiddleImg from "./MiddleImg";
import RightSideCard from "./RightSideCard";

const Comparison = () => {
  return (
    <section id="comparison" className="section-pad relative w-full -mb-16 overflow-hidden px-4 sm:px-8 md:px-12">
      <div className="global-pos relative w-full">
      {/* Header */}
      <div>
        <Header />
      </div>

      {/* Comparison Grid */}
      <div className="-mt-6 sm:-mt-8 md:-mt-10">
        <div className="grid min-h-[400px] md:min-h-[500px] grid-cols-1 items-center gap-6 md:grid-cols-3 md:gap-4 lg:gap-8">

          {/* Left Card */}
          <div className="flex min-h-[350px] md:min-h-[400px] items-center justify-center rounded-md">
            <LeftSideCard />
          </div>

          {/* Center Circle */}
          <div className="flex items-center justify-center my-2 md:my-0">
            <MiddleImg />
          </div>

          {/* Right Card */}
          <div className="flex min-h-[350px] md:min-h-[400px] items-center justify-center rounded-md">
            <RightSideCard />
          </div>

        </div>
      </div>
      </div>
    </section>
  );
};

export default Comparison;