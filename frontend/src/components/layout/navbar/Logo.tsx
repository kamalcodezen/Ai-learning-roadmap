import Image from "next/image";
import Link from "next/link";
import brandLogo from "../../../../public/brand/AI-Pather-blue.png"

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5"
      aria-label="Aurevo home"
    >
      <span
        className="flex w-12 h-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "#ceff1f" }}
      >
        <Image src={brandLogo} alt="Brand-logo" className="ml-1" height={20} width={20}/>
      </span>

        {/* Temporary hardcode text pixels */}
      <span className="font-sans text-[24px] font-semibold tracking-[-0.03em] text-neutral-800">
        Ai Pather
      </span>
    </Link>
  );
}