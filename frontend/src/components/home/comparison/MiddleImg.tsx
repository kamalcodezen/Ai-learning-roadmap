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
              alt="Project logo"
              width={80}
              height={80}
              className="h-15 w-15 object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddleImg;