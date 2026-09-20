import Image from "next/image";

const MiddleImg = () => {
  return (
    <div className="flex w-full items-center justify-center relative">
      <div className="relative w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-md aspect-square flex items-center justify-center">
        {/* Main Spinning Wheel */}
        <div className="animate-[spin_20s_linear_infinite] w-full h-full">
          <Image
            src="/images/comparison/comparison.png"
            alt="Comparison feature preview"
            width={1000}
            height={1000}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        {/* Center Logo - perfectly sized and optically aligned with the inner circle */}
        <div className="absolute top-1/2 left-[50.8%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none w-[13%]">
          <Image
            src="/brand/logo-p-black.png"
            alt="AI Pather"
            width={84}
            height={100}
            className="w-full h-auto object-contain drop-shadow-sm"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default MiddleImg;
