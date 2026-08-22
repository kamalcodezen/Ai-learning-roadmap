import Image from "next/image";

const Middelimg = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="relative w-full">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <Image
              src="/brand/AI-Pather-blue.png"
              alt="Project logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Middelimg;