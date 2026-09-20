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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div>
            <Image
              src="/brand/AI-Pather-blue.png"
              alt="AI Pather"
              width={140}
              height={30}
              className="h-[clamp(20px,3vw,30px)] w-auto object-contain block dark:hidden"
            />
            <Image
              src="/brand/AI-Pather-white.png"
              alt="AI Pather"
              width={140}
              height={30}
              className="h-[clamp(20px,3vw,30px)] w-auto object-contain hidden dark:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddleImg;
