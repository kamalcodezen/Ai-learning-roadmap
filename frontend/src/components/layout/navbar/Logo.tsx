import Image from "next/image";
import Link from "next/link";
import brandLogo from "../../../../public/brand/AI-Pather-blue.png"

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 md:gap-2.5"
      aria-label="AIPather home"
    >
      <span
        className="flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "#ceff1f" }}
      >
        <Image src={brandLogo} alt="Brand-logo" className="ml-1 w-4 h-4 md:w-5 md:h-5" height={20} width={20}/>
      </span>

        {/* Temporary hardcode text pixels */}
      <span className="font-sans text-[20px] md:text-[24px] font-semibold text-foreground">
        AI Pather
      </span>
    </Link>
  );
}