import React from "react";
import Header from "./Header";
import LefeSideCard from "./LeftSideCard";
import Middelimg from "./Middelimg";
import RightSideCard from "./RightSideCard";

const Comparison = () => {
  return (
    <section className="relative w-full px-4 py-10 sm:px-8 md:px-12">
      <div className="global-pos w-full rounded-[32px] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <Header />
      </div>

      {/* Comparison Grid */}
      <div className="mt-3 rounded-[32px] md:p-6 lg:p-8">
        <div className="grid min-h-[500px] grid-cols-1 items-center gap-6 md:grid-cols-3 md:gap-8">

          {/* Left Card */}
          <div className="flex min-h-[400px] items-center justify-center rounded-[30px] p-8">
            <LefeSideCard />
          </div>

          {/* Center Circle */}
          <div className="flex items-center justify-center">
            <Middelimg />
          </div>

          {/* Right Card */}
          <div className="flex min-h-[400px] items-center justify-center rounded-[30px]  p-8">
            <RightSideCard />
          </div>

        </div>
      </div>
      </div>
    </section>
  );
};

export default Comparison;