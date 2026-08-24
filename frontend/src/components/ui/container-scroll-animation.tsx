"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll(
    isMounted ? { target: containerRef } : {}
  );
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.3], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  return (
    <div
      className={`flex items-center justify-center relative p-2 md:p-20 ${
        isMobile ? "" : "h-[60rem] md:h-[80rem]"
      }`}
      ref={containerRef}
    >
      <div
        className={`w-full relative ${isMobile ? "py-10" : "py-10 md:py-40"}`}
        style={{
          perspective: isMobile ? "none" : "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} isMobile={isMobile} />
        <Card rotate={rotate} translate={translate} scale={scale} isMobile={isMobile}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
  isMobile,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
  isMobile?: boolean;
}) => {
  return (
    <motion.div
      style={{
        translateY: isMobile ? 0 : translate,
      }}
      className={`div max-w-5xl mx-auto text-center ${isMobile ? "mb-10" : ""}`}
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
  isMobile,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
  isMobile?: boolean;
}) => {
  return (
    <motion.div
      style={{
        rotateX: isMobile ? 0 : rotate,
        scale: isMobile ? 1 : scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={`max-w-5xl mx-auto h-fit w-full border-4 border-[#6C6C6C] p-2 md:p-2 bg-[#222222] rounded-[30px] shadow-2xl flex flex-col ${isMobile ? "mt-4" : "-mt-12"}`}
    >
      {/* MacOS Window Controls Mockup */}
      <div className="flex items-center gap-2 px-4 pb-2 pt-2">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
      </div>
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden overflow-y-auto rounded-xl bg-gray-100 dark:bg-zinc-900 md:rounded-b-2xl md:rounded-t-none md:p-4 p-2">
        {children}
      </div>
    </motion.div>
  );
};
