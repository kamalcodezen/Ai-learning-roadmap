"use client";
import React from "react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-center relative p-2 md:p-10">
      <div className="w-full relative py-4 md:py-10">
        <div className="max-w-5xl mx-auto text-center mb-6 md:mb-10">
          {titleComponent}
        </div>
        <div
          className={`max-w-5xl mx-auto min-h-[80vh] h-fit w-full border-4 border-primary/30 p-2 md:p-2 bg-brand/30 rounded-[30px] flex flex-col -mt-4 md:-mt-8`}
        >
          {/* MacOS Window Controls Mockup */}
          <div className="flex items-center gap-2 px-4 pb-2 pt-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden overflow-y-auto rounded-xl border border-transparent dark:border-brand/20 bg-gray-100 dark:bg-zinc-900 md:rounded-b-2xl md:rounded-t-none md:p-4 p-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
