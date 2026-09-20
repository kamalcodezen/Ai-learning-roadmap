import Image from "next/image";

const MiddleImg = () => {
  return (
    <div className="flex w-full items-center justify-center relative">
      <div className="relative w-full max-w-md">
        {/* Main Image */}
        <div className="animate-[spin_20s_linear_infinite]">
          <Image
            src="/images/comparison/comparison.png"
            alt="Comparison feature preview"
            width={1000}
            height={1000}
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Center Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <Image
            src="/brand/logo-p-black.png"
            alt="AI Pather"
            width={84}
            height={100}
            className="w-[clamp(36px,6.5vw,60px)] h-auto object-contain drop-shadow-sm"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default MiddleImg;
